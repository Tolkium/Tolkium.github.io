// components/background-animation.component.ts
import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
  PLATFORM_ID,
  ErrorHandler,
  NgZone,
  inject
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import {
  Point,
  RGB,
  ANIMATION_CONSTANTS,
  AnimationConfig
} from '../../../models/animation.constants';
import { QuadTree } from '../../../utils/quad-tree';
import { 
  selectEnableBackgroundAnimation,
  selectEnableMagneticForce,
  selectEnableRepulsionForce,
  selectEnableDamping,
  selectEnableBrownianMotion,
  selectEnableClusterBreaking,
  selectNumPoints,
  selectConnectionRadius,
  selectMagneticRadius,
  selectMagneticStrength,
  selectMinSpeed,
  selectMaxSpeed,
  selectPointsSize,
  selectLineWidth,
  selectRepulsionRadius,
  selectRepulsionStrength,
  selectDampingFactor,
  selectBrownianStrength,
  selectClusterThreshold,
  selectExplosionForce,
  selectClusterCheckInterval,
  selectMinClusterSize,
  selectMagneticMode,
  selectMagneticMinStrength,
  selectMagneticMaxStrength,
  selectMagneticInverseCoefficient,
  selectMagneticFluctuationSpeed,
  selectEnablePolygonStabilizer,
  selectPolygonTargetSpacing,
  selectPolygonStrength
} from '../../../core/store/ui.selectors';
import { ParticlePhysicsService } from '../../../core/services/particle-physics.service';

@Component({
  selector: 'app-background-animation',
  standalone: true,
  template: `
    <canvas #canvas
      class="fixed top-0 left-0 w-screen h-screen"
      style="width: 100vw; height: 100vh;"
      [attr.aria-label]="'Background animation'"
    ></canvas>
  `
})
export class BackgroundAnimationComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);
  private readonly errorHandler = inject(ErrorHandler);
  private readonly store = inject(Store);
  private readonly physicsService = inject(ParticlePhysicsService);

  @ViewChild('canvas', { static: true })
  private readonly canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private points: Point[] = [];
  private animationId: number = 0;
  private isRunning = false;
  private isAnimationEnabled = true;
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private currentTimeMs: number = 0;
  
  // Subscriptions
  private resizeSubscription?: Subscription;
  private scrollSubscription?: Subscription;
  private animationStateSubscription?: Subscription;
  private magneticForceSubscription?: Subscription;
  private repulsionForceSubscription?: Subscription;
  private dampingSubscription?: Subscription;
  private brownianMotionSubscription?: Subscription;
  private clusterBreakingSubscription?: Subscription;
  private polygonStabilizerSubscription?: Subscription;
  private scrollTimeout: ReturnType<typeof setTimeout> | undefined;

  // Physics toggle states
  private enableMagneticForce = true;
  private enableRepulsionForce = true;
  private enableDamping = true;
  private enableBrownianMotion = true;
  private enableClusterBreaking = true;
  private enablePolygonStabilizer = false;

  // Dynamic configuration from store (mutable copy)
  private config = {
    showBorder: false,
    glowPoints: true,
    glowLines: false,
    NUM_POINTS: ANIMATION_CONSTANTS.NUM_POINTS,
    CONNECTION_RADIUS: ANIMATION_CONSTANTS.CONNECTION_RADIUS,
    MAGNETIC_RADIUS: ANIMATION_CONSTANTS.MAGNETIC_RADIUS,
    MAGNETIC_STRENGTH: ANIMATION_CONSTANTS.MAGNETIC_STRENGTH,
    MIN_SPEED: ANIMATION_CONSTANTS.MIN_SPEED,
    MAX_SPEED: ANIMATION_CONSTANTS.MAX_SPEED,
    POINTS_SIZE: ANIMATION_CONSTANTS.POINTS_SIZE,
    LINE_WIDTH: ANIMATION_CONSTANTS.LINE_WIDTH,
    COLORS: ANIMATION_CONSTANTS.COLORS,
    GLOW: ANIMATION_CONSTANTS.GLOW,
    REPULSION_RADIUS: ANIMATION_CONSTANTS.REPULSION_RADIUS,
    REPULSION_STRENGTH: ANIMATION_CONSTANTS.REPULSION_STRENGTH,
    DAMPING_FACTOR: ANIMATION_CONSTANTS.DAMPING_FACTOR,
    BROWNIAN_STRENGTH: ANIMATION_CONSTANTS.BROWNIAN_STRENGTH,
    CLUSTER_THRESHOLD: ANIMATION_CONSTANTS.CLUSTER_THRESHOLD,
    EXPLOSION_FORCE: ANIMATION_CONSTANTS.EXPLOSION_FORCE,
    CLUSTER_CHECK_INTERVAL: ANIMATION_CONSTANTS.CLUSTER_CHECK_INTERVAL,
    MIN_CLUSTER_SIZE: ANIMATION_CONSTANTS.MIN_CLUSTER_SIZE,
    // Magnetic behavior extensions
    MAGNETIC_MODE: 'classic' as 'classic' | 'inverse' | 'fluctuating',
    MAGNETIC_MIN_STRENGTH: 0.0001,
    MAGNETIC_MAX_STRENGTH: 0.003,
    MAGNETIC_INVERSE_COEFFICIENT: 1.0,
    MAGNETIC_FLUCTUATION_SPEED: 1.0,
    POLYGON_TARGET_SPACING: 120,
    POLYGON_STRENGTH: 0.0008
  };

  // Subscriptions for config values
  private configSubscriptions: Subscription[] = [];

  public ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      this.initializeCanvas();

      // Subscribe to animation state from store
      this.animationStateSubscription = this.store
        .select(selectEnableBackgroundAnimation)
        .subscribe(enabled => {
          this.isAnimationEnabled = enabled;
          
          if (enabled && !this.isRunning) {
            // Resume animation - reset lastFrameTime to prevent jump
            this.isRunning = true;
            this.lastFrameTime = performance.now();
            this.ngZone.runOutsideAngular(() => {
              this.animate(performance.now());
            });
          } else if (!enabled && this.isRunning) {
            // Pause animation - render one final frame then stop
            this.isRunning = false;
            if (this.animationId) {
              cancelAnimationFrame(this.animationId);
              this.animationId = 0;
            }
            // Calculate connections before rendering static frame
            this.calculateConnectionsForStaticRender();
            // Clear and render static frame
            this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
            this.drawScene();
          }
        });

      // Subscribe to physics toggle states
      this.magneticForceSubscription = this.store
        .select(selectEnableMagneticForce)
        .subscribe(enabled => this.enableMagneticForce = enabled);

      this.repulsionForceSubscription = this.store
        .select(selectEnableRepulsionForce)
        .subscribe(enabled => this.enableRepulsionForce = enabled);

      this.dampingSubscription = this.store
        .select(selectEnableDamping)
        .subscribe(enabled => this.enableDamping = enabled);

      this.brownianMotionSubscription = this.store
        .select(selectEnableBrownianMotion)
        .subscribe(enabled => this.enableBrownianMotion = enabled);

      this.clusterBreakingSubscription = this.store
        .select(selectEnableClusterBreaking)
        .subscribe(enabled => this.enableClusterBreaking = enabled);

      this.polygonStabilizerSubscription = this.store
        .select(selectEnablePolygonStabilizer)
        .subscribe(enabled => this.enablePolygonStabilizer = enabled);

      // Subscribe to all config value changes
      this.configSubscriptions.push(
        this.store.select(selectNumPoints).subscribe(v => {
          const oldCount = this.config.NUM_POINTS;
          this.config.NUM_POINTS = v;
          // Dynamically adjust particle count
          if (oldCount !== v && this.points.length > 0) {
            this.adjustParticleCount(oldCount, v);
          }
        }),
        this.store.select(selectConnectionRadius).subscribe(v => this.config.CONNECTION_RADIUS = v),
        this.store.select(selectMagneticRadius).subscribe(v => this.config.MAGNETIC_RADIUS = v),
        this.store.select(selectMagneticStrength).subscribe(v => this.config.MAGNETIC_STRENGTH = v),
        this.store.select(selectMagneticMode).subscribe(v => this.config.MAGNETIC_MODE = v),
        this.store.select(selectMagneticMinStrength).subscribe(v => this.config.MAGNETIC_MIN_STRENGTH = v),
        this.store.select(selectMagneticMaxStrength).subscribe(v => this.config.MAGNETIC_MAX_STRENGTH = v),
        this.store.select(selectMagneticInverseCoefficient).subscribe(v => this.config.MAGNETIC_INVERSE_COEFFICIENT = v),
        this.store.select(selectMagneticFluctuationSpeed).subscribe(v => this.config.MAGNETIC_FLUCTUATION_SPEED = v),
        this.store.select(selectPolygonTargetSpacing).subscribe(v => this.config.POLYGON_TARGET_SPACING = v),
        this.store.select(selectPolygonStrength).subscribe(v => this.config.POLYGON_STRENGTH = v),
        this.store.select(selectMinSpeed).subscribe(v => this.config.MIN_SPEED = v),
        this.store.select(selectMaxSpeed).subscribe(v => this.config.MAX_SPEED = v),
        this.store.select(selectPointsSize).subscribe(v => this.config.POINTS_SIZE = v),
        this.store.select(selectLineWidth).subscribe(v => this.config.LINE_WIDTH = v),
        this.store.select(selectRepulsionRadius).subscribe(v => this.config.REPULSION_RADIUS = v),
        this.store.select(selectRepulsionStrength).subscribe(v => this.config.REPULSION_STRENGTH = v),
        this.store.select(selectDampingFactor).subscribe(v => this.config.DAMPING_FACTOR = v),
        this.store.select(selectBrownianStrength).subscribe(v => this.config.BROWNIAN_STRENGTH = v),
        this.store.select(selectClusterThreshold).subscribe(v => this.config.CLUSTER_THRESHOLD = v),
        this.store.select(selectExplosionForce).subscribe(v => this.config.EXPLOSION_FORCE = v),
        this.store.select(selectClusterCheckInterval).subscribe(v => this.config.CLUSTER_CHECK_INTERVAL = v),
        this.store.select(selectMinClusterSize).subscribe(v => this.config.MIN_CLUSTER_SIZE = v)
      );

      this.resizeSubscription = fromEvent(window, 'resize')
        .pipe(debounceTime(250))
        .subscribe(() => this.handleResize());

      // Add scroll event listener
      this.scrollSubscription = fromEvent(window, 'scroll')
        .pipe(debounceTime(50))
        .subscribe(() => {
          if (!this.isAnimationEnabled) return; // Don't handle scroll if animation is disabled
          
          this.isRunning = false;
          clearTimeout(this.scrollTimeout);

          // Resume animation after scrolling stops
          this.scrollTimeout = setTimeout(() => {
            if (this.isAnimationEnabled) {
              this.isRunning = true;
              this.lastFrameTime = performance.now(); // Reset to prevent jump
              this.animate(performance.now());
            }
          }, 150);
        });

      // Run animation outside Angular's zone for better performance (if enabled)
      // If disabled, render one static frame
      if (this.isAnimationEnabled) {
        this.ngZone.runOutsideAngular(() => {
          this.animate(performance.now());
        });
      } else {
        // Calculate connections before rendering initial static frame
        this.calculateConnectionsForStaticRender();
        // Render initial static frame when animation is disabled
        this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
        this.drawScene();
      }
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  public ngOnDestroy(): void {
    this.cleanup();
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    this.scrollSubscription?.unsubscribe();
    this.animationStateSubscription?.unsubscribe();
    this.magneticForceSubscription?.unsubscribe();
    this.repulsionForceSubscription?.unsubscribe();
    this.dampingSubscription?.unsubscribe();
    this.brownianMotionSubscription?.unsubscribe();
    this.clusterBreakingSubscription?.unsubscribe();
    this.polygonStabilizerSubscription?.unsubscribe();
    this.configSubscriptions.forEach(sub => sub.unsubscribe());
  }

  private initializeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const context = canvas.getContext('2d', { alpha: true });

    if (!context) {
      throw new Error('Canvas 2D context not supported in this browser');
    }

    this.ctx = context;
    this.handleResize();
    this.initPoints();
    this.isRunning = true;
  }

  private handleResize = (): void => {
    const canvas = this.canvasRef.nativeElement;
    const dpr = window.devicePixelRatio || 1;

    // Get the actual viewport dimensions
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;

    // Set display size using viewport units
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';

    // Set actual size in memory (accounting for device pixel ratio)
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    // Scale context to ensure correct drawing operations
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Reinitialize points when viewport size changes significantly
    const currentArea = width * height;
    const previousArea = (canvas.width / dpr) * (canvas.height / dpr);
    if (Math.abs(currentArea - previousArea) / previousArea > 0.2) {
      this.initPoints();
    }

    // If animation is disabled, re-render the static frame after resize
    if (!this.isAnimationEnabled && this.ctx) {
      // Recalculate connections after resize for static render
      this.calculateConnectionsForStaticRender();
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.drawScene();
    }
  };

  private initPoints(): void {
    const canvas = this.canvasRef.nativeElement;
    this.points = Array.from({ length: this.config.NUM_POINTS }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      color: i % 2 === 0 ? this.config.COLORS.ORANGE : this.config.COLORS.PURPLE,
      connections: 0
    }));
  }

  private animate = (timestamp: number): void => {
    if (!this.ctx || !this.isRunning || !this.isAnimationEnabled) return;

    try {
      const deltaTime = timestamp - this.lastFrameTime;
      this.lastFrameTime = timestamp;
      this.currentTimeMs = timestamp;

      // Increment frame counter
      this.frameCount++;

      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);

      // Update and draw
      this.updatePoints(deltaTime / 16.67);
      this.drawScene();

      // Check for cluster breaking periodically
      if (this.enableClusterBreaking && 
          this.frameCount % this.config.CLUSTER_CHECK_INTERVAL === 0) {
        this.physicsService.breakUpClusters(
          this.points,
          this.config.CLUSTER_THRESHOLD,
          this.config.EXPLOSION_FORCE,
          this.config.MIN_CLUSTER_SIZE
        );
      }

      this.animationId = requestAnimationFrame(this.animate);
    } catch (error) {
      this.errorHandler.handleError(error);
      this.cleanup();
    }
  };

  private updatePoints(deltaTime: number): void {
    const canvas = this.canvasRef.nativeElement;
    const quadTree = new QuadTree({
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height
    });

    // Reset connections and populate quadtree
    this.points.forEach(point => {
      point.connections = 0;
      quadTree.insert(point);
    });

    // Update point positions and handle interactions
    this.points.forEach(point => {
      // Find nearby points using quadtree (performance optimization)
      const searchBounds = {
        x: point.x - this.config.CONNECTION_RADIUS,
        y: point.y - this.config.CONNECTION_RADIUS,
        width: this.config.CONNECTION_RADIUS * 2,
        height: this.config.CONNECTION_RADIUS * 2
      };

      const nearbyPoints = quadTree.query(searchBounds);

      // Apply physics forces to nearby points
      nearbyPoints.forEach(otherPoint => {
        if (point === otherPoint) return;

        // Calculate distance once for performance (avoid repeated calculation)
        const distance = this.physicsService.getDistance(point, otherPoint);
        
        if (distance < this.config.CONNECTION_RADIUS) {
          point.connections++;
          otherPoint.connections++;

          // Apply repulsion force at very close range (prevents sticking)
          if (this.enableRepulsionForce && distance < this.config.REPULSION_RADIUS) {
            this.physicsService.applyRepulsionForce(
              point,
              otherPoint,
              distance,
              this.config.REPULSION_RADIUS,
              this.config.REPULSION_STRENGTH
            );
          }
          // Apply magnetic attraction at medium distance (creates clustering)
          else if (this.enableMagneticForce && distance < this.config.MAGNETIC_RADIUS) {
            if (this.config.MAGNETIC_MODE === 'classic') {
              this.physicsService.applyMagneticForce(
                point,
                otherPoint,
                distance,
                this.config.MAGNETIC_RADIUS,
                this.config.MAGNETIC_STRENGTH
              );
            } else if (this.config.MAGNETIC_MODE === 'inverse') {
              this.physicsService.applyMagneticForceInverse(
                point,
                otherPoint,
                distance,
                this.config.MAGNETIC_RADIUS,
                this.config.MAGNETIC_MIN_STRENGTH,
                this.config.MAGNETIC_MAX_STRENGTH,
                this.config.MAGNETIC_INVERSE_COEFFICIENT
              );
            } else if (this.config.MAGNETIC_MODE === 'fluctuating') {
              const dynamicStrength = this.physicsService.computeFluctuatingStrength(
                this.config.MAGNETIC_MIN_STRENGTH,
                this.config.MAGNETIC_MAX_STRENGTH,
                this.config.MAGNETIC_FLUCTUATION_SPEED,
                this.currentTimeMs
              );
              this.physicsService.applyMagneticForce(
                point,
                otherPoint,
                distance,
                this.config.MAGNETIC_RADIUS,
                dynamicStrength
              );
            }
          }

          if (this.enablePolygonStabilizer && distance < this.config.CONNECTION_RADIUS) {
            this.physicsService.applyPolygonStabilizer(
              point,
              otherPoint,
              distance,
              this.config.POLYGON_TARGET_SPACING,
              this.config.POLYGON_STRENGTH
            );
          }
        }
      });

      // Apply Brownian motion (random micro-movements)
      if (this.enableBrownianMotion) {
        this.physicsService.applyBrownianMotion(point, this.config.BROWNIAN_STRENGTH);
      }

      // Update position based on velocity
      point.x += point.vx * deltaTime;
      point.y += point.vy * deltaTime;

      // Handle boundary collisions first
      this.handleBoundaryCollision(point, canvas);

      // Apply velocity damping AFTER position update to avoid vibration
      // (damping before speed constraint would cause oscillation)
      if (this.enableDamping) {
        this.physicsService.applyDamping(point, this.config.DAMPING_FACTOR);
      }

      // Constrain speed to min/max limits AFTER damping
      this.physicsService.constrainSpeed(point, this.config.MIN_SPEED, this.config.MAX_SPEED);
    });
  }

  private drawScene(): void {
    this.withCanvasState(() => {
      // Draw connections first
      this.drawConnections();
      // Then draw points on top
      this.drawPoints();
    });
  }

  private handleBoundaryCollision(point: Point, canvas: HTMLCanvasElement): void {
    const bounceCoefficient = 0.95; // Energy loss on collision
    const margin = this.config.POINTS_SIZE; // Prevent points from getting stuck in boundaries

    // Handle horizontal boundaries
    if (point.x - margin < 0) {
      point.x = margin;
      point.vx = Math.abs(point.vx) * bounceCoefficient;
    } else if (point.x + margin > canvas.width) {
      point.x = canvas.width - margin;
      point.vx = -Math.abs(point.vx) * bounceCoefficient;
    }

    // Handle vertical boundaries
    if (point.y - margin < 0) {
      point.y = margin;
      point.vy = Math.abs(point.vy) * bounceCoefficient;
    } else if (point.y + margin > canvas.height) {
      point.y = canvas.height - margin;
      point.vy = -Math.abs(point.vy) * bounceCoefficient;
    }

    // Apply minimum speed after collision to prevent sticking
    const speed = Math.hypot(point.vx, point.vy);
    if (speed < this.config.MIN_SPEED) {
      const scale = this.config.MIN_SPEED / speed;
      point.vx *= scale;
      point.vy *= scale;
    }
  }

  private drawPoints(): void {
    this.points.forEach(point => {
      if (!this.isInViewport(point)) return;

      this.withCanvasState(() => {
        if (this.config.glowPoints) {
          this.ctx.shadowBlur = this.config.GLOW.POINTS_INTENSITY;
          this.ctx.shadowColor = point.color;
        }

        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, this.config.POINTS_SIZE, 0, Math.PI * 2);
        this.ctx.fillStyle = point.color;
        this.ctx.fill();
      });
    });
  }

  /**
   * Calculates connections for static rendering when animation is disabled.
   * This ensures points have proper connection counts for color blending.
   */
  private calculateConnectionsForStaticRender(): void {
    // Reset all connections
    this.points.forEach(point => {
      point.connections = 0;
    });

    // Calculate connections based on proximity
    this.points.forEach((point, i) => {
      this.points.slice(i + 1).forEach(otherPoint => {
        const distance = this.physicsService.getDistance(point, otherPoint);
        if (distance < this.config.CONNECTION_RADIUS) {
          point.connections++;
          otherPoint.connections++;
        }
      });
    });
  }

  private drawConnections(): void {
    this.points.forEach((point, i) => {
      if (!this.isInViewport(point)) return;

      this.points.slice(i + 1).forEach(otherPoint => {
        if (!this.isInViewport(otherPoint)) return;

        const distance = this.physicsService.getDistance(point, otherPoint);
        if (distance < this.config.CONNECTION_RADIUS) {
          this.drawConnection(point, otherPoint, distance);
        }
      });
    });
  }

  private hexToRgb(hex: string): RGB {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  private blendColors(color1: string, color2: string, weight: number): string {
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);

    const r = Math.round(c1.r * weight + c2.r * (1 - weight));
    const g = Math.round(c1.g * weight + c2.g * (1 - weight));
    const b = Math.round(c1.b * weight + c2.b * (1 - weight));

    return `rgb(${r},${g},${b})`;
  }

  private drawConnection(point: Point, otherPoint: Point, distance: number): void {
    this.withCanvasState(() => {
      const totalConnections = point.connections + otherPoint.connections;
      const weight = point.connections / totalConnections;
      const connectionColor = this.blendColors(point.color, otherPoint.color, weight);

      if (this.config.glowLines) {
        this.ctx.shadowBlur = this.config.GLOW.LINES_INTENSITY;
        this.ctx.shadowColor = connectionColor;
      }

      this.ctx.beginPath();
      this.ctx.moveTo(point.x, point.y);
      this.ctx.lineTo(otherPoint.x, otherPoint.y);
      this.ctx.strokeStyle = connectionColor;
      this.ctx.lineWidth = this.config.LINE_WIDTH;
      this.ctx.globalAlpha = 1 - (distance / this.config.CONNECTION_RADIUS);
      this.ctx.stroke();
    });
  }

  private cleanup(): void {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.resizeSubscription?.unsubscribe();
  }

  // Utility methods
  private withCanvasState(callback: () => void): void {
    this.ctx.save();
    callback();
    this.ctx.restore();
  }

  private isInViewport(point: Point): boolean {
    const margin = this.config.CONNECTION_RADIUS;
    const canvas = this.canvasRef.nativeElement;
    return point.x + margin >= 0 &&
           point.x - margin <= canvas.width &&
           point.y + margin >= 0 &&
           point.y - margin <= canvas.height;
  }

  /**
   * Dynamically adjusts the number of particles when the config changes.
   * Adds new particles or removes excess ones while maintaining animation continuity.
   */
  private adjustParticleCount(oldCount: number, newCount: number): void {
    const canvas = this.canvasRef.nativeElement;
    
    if (newCount > oldCount) {
      // Add new particles
      const toAdd = newCount - oldCount;
      for (let i = 0; i < toAdd; i++) {
        this.points.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          color: i % 2 === 0 ? this.config.COLORS.ORANGE : this.config.COLORS.PURPLE,
          connections: 0
        });
      }
    } else if (newCount < oldCount) {
      // Remove excess particles
      this.points = this.points.slice(0, newCount);
    }
  }

  // Note: getDistance, applyMagneticEffect, applyRepulsionForce, applyDamping,
  // applyBrownianMotion, and constrainSpeed are now handled by ParticlePhysicsService
}
