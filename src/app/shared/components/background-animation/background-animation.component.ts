import {
  Component,
  ElementRef,
  ErrorHandler,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  effect,
  inject
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MemoizedSelector, Store } from '@ngrx/store';
import { ANIMATION_CONSTANTS, Point, RGB } from '../../../models/animation.constants';
import { QuadTree } from '../../../utils/quad-tree';
import {
  selectBrownianStrength,
  selectConnectionRadius,
  selectCooldownDuration,
  selectCooldownMinDistance,
  selectCooldownResetDistance,
  selectDampingFactor,
  selectEnableBackgroundAnimation,
  selectEnableBrownianMotion,
  selectEnableCooldownAttraction,
  selectEnableDamping,
  selectEnableMagneticForce,
  selectEnablePolygonStabilizer,
  selectEnableRepulsionForce,
  selectLineWidth,
  selectMagneticRadius,
  selectMagneticStrength,
  selectMaxSpeed,
  selectMinSpeed,
  selectNumPoints,
  selectPointsSize,
  selectPolygonStrength,
  selectPolygonTargetSpacing,
  selectRepulsionRadius,
  selectRepulsionStrength
} from '../../../core/store/ui.selectors';
import { AnimationColorService } from '../../../core/services/animation-color.service';
import { ParticlePhysicsService } from '../../../core/services/particle-physics.service';

interface ConnectionPair {
  point: Point;
  otherPoint: Point;
  distance: number;
}

@Component({
  selector: 'app-background-animation',
  standalone: true,
  template: `
    <canvas
      #canvas
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
  private readonly animationColorService = inject(AnimationColorService);

  @ViewChild('canvas', { static: true })
  private readonly canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly subscriptions = new Subscription();
  private readonly EPSILON = 1e-6;
  private readonly BOUNCE_COEFFICIENT = 0.95;
  private readonly REFERENCE_DIMENSION = 2160;

  private ctx!: CanvasRenderingContext2D;
  private points: Point[] = [];
  private connectionPairs: ConnectionPair[] = [];
  private animationId = 0;
  private isRunning = false;
  private isAnimationEnabled = true;
  private wasRunningBeforeBlur = false;
  private lastFrameTime = 0;
  private frameCount = 0;
  private currentTimeMs = 0;
  private scrollPauseTimeout: ReturnType<typeof setTimeout> | undefined;

  private viewportWidth = 0;
  private viewportHeight = 0;
  private devicePixelRatio = 1;

  // Physics toggle states
  private enableMagneticForce = true;
  private enableRepulsionForce = true;
  private enableDamping = true;
  private enableBrownianMotion = true;
  private enablePolygonStabilizer = false;

  // Cooldown attraction state
  private enableCooldownAttraction = false;
  private cooldownMinDistance = 20;
  private cooldownResetDistance = 80;
  private cooldownDuration = 3000;
  private readonly cooldownMap = new Map<string, number>();
  private cooldownCleanupCounter = 0;

  private readonly colorEffect = effect(() => {
    const c1 = this.animationColorService.color1();
    const c2 = this.animationColorService.color2();
    this.config.COLORS.ORANGE = c1;
    this.config.COLORS.PURPLE = c2;
    if (this.ctx && this.points.length > 0) {
      this.recolorPoints();
      this.renderStaticFrameIfPaused();
    }
  });

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
    COLORS: { ...ANIMATION_CONSTANTS.COLORS },
    GLOW: ANIMATION_CONSTANTS.GLOW,
    REPULSION_RADIUS: ANIMATION_CONSTANTS.REPULSION_RADIUS,
    REPULSION_STRENGTH: ANIMATION_CONSTANTS.REPULSION_STRENGTH,
    DAMPING_FACTOR: ANIMATION_CONSTANTS.DAMPING_FACTOR,
    BROWNIAN_STRENGTH: ANIMATION_CONSTANTS.BROWNIAN_STRENGTH,
    POLYGON_TARGET_SPACING: 120,
    POLYGON_STRENGTH: 0.0008,
    COOLDOWN_MIN_DISTANCE: 20,
    COOLDOWN_RESET_DISTANCE: 80,
    COOLDOWN_DURATION: 3000
  };

  private computeActualNumPoints(): number {
    const density = this.config.NUM_POINTS;
    const minDim = Math.min(this.viewportWidth, this.viewportHeight);
    return Math.max(20, Math.round(density * minDim / this.REFERENCE_DIMENSION));
  }

  public ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      this.initializeCanvas();
      this.bindStoreState();
      this.bindWindowEvents();

      if (this.isAnimationEnabled) {
        this.startAnimation();
      } else {
        this.renderStaticFrame();
      }
    } catch (error) {
      this.errorHandler.handleError(error);
      this.stopAnimation();
    }
  }

  public ngOnDestroy(): void {
    this.stopAnimation();
    if (this.scrollPauseTimeout) {
      clearTimeout(this.scrollPauseTimeout);
    }
    this.subscriptions.unsubscribe();
  }

  private initializeCanvas(): void {
    const context = this.canvasRef.nativeElement.getContext('2d', { alpha: true });
    if (!context) {
      throw new Error('Canvas 2D context not supported in this browser');
    }

    this.ctx = context;
    this.handleResize(true);
  }

  private bindStoreState(): void {
    this.subscriptions.add(
      this.store.select(selectEnableBackgroundAnimation).subscribe(enabled => {
        this.isAnimationEnabled = enabled;

        if (enabled) {
          this.startAnimation();
        } else {
          this.stopAnimation();
          this.renderStaticFrame();
        }
      })
    );

    this.subscriptions.add(
      this.store.select(selectEnableMagneticForce).subscribe(enabled => (this.enableMagneticForce = enabled))
    );
    this.subscriptions.add(
      this.store.select(selectEnableRepulsionForce).subscribe(enabled => (this.enableRepulsionForce = enabled))
    );
    this.subscriptions.add(
      this.store.select(selectEnableDamping).subscribe(enabled => (this.enableDamping = enabled))
    );
    this.subscriptions.add(
      this.store.select(selectEnableBrownianMotion).subscribe(enabled => (this.enableBrownianMotion = enabled))
    );
    this.subscriptions.add(
      this.store.select(selectEnablePolygonStabilizer).subscribe(enabled => (this.enablePolygonStabilizer = enabled))
    );

    this.subscriptions.add(
      this.store.select(selectEnableCooldownAttraction).subscribe(enabled => {
        this.enableCooldownAttraction = enabled;
        if (!enabled) {
          this.cooldownMap.clear();
        }
      })
    );
    this.bindNumericConfig(selectCooldownMinDistance, value => {
      this.config.COOLDOWN_MIN_DISTANCE = value;
      this.cooldownMinDistance = value;
    });
    this.bindNumericConfig(selectCooldownResetDistance, value => {
      this.config.COOLDOWN_RESET_DISTANCE = value;
      this.cooldownResetDistance = value;
    });
    this.bindNumericConfig(selectCooldownDuration, value => {
      this.config.COOLDOWN_DURATION = value;
      this.cooldownDuration = value;
    });

    this.subscriptions.add(
      this.store.select(selectNumPoints).subscribe(density => {
        const oldDensity = this.config.NUM_POINTS;
        this.config.NUM_POINTS = density;
        if (this.points.length > 0 && oldDensity !== density) {
          this.adjustParticleCount(this.computeActualNumPoints());
          this.renderStaticFrameIfPaused();
        }
      })
    );

    this.bindNumericConfig(selectConnectionRadius, value => (this.config.CONNECTION_RADIUS = value));
    this.bindNumericConfig(selectMagneticRadius, value => (this.config.MAGNETIC_RADIUS = value));
    this.bindNumericConfig(selectMagneticStrength, value => (this.config.MAGNETIC_STRENGTH = value));
    this.bindNumericConfig(selectPointsSize, value => (this.config.POINTS_SIZE = value));
    this.bindNumericConfig(selectLineWidth, value => (this.config.LINE_WIDTH = value));
    this.bindNumericConfig(selectRepulsionRadius, value => (this.config.REPULSION_RADIUS = value));
    this.bindNumericConfig(selectRepulsionStrength, value => (this.config.REPULSION_STRENGTH = value));
    this.bindNumericConfig(selectDampingFactor, value => (this.config.DAMPING_FACTOR = value));
    this.bindNumericConfig(selectBrownianStrength, value => (this.config.BROWNIAN_STRENGTH = value));
    this.bindNumericConfig(selectMinSpeed, value => (this.config.MIN_SPEED = value));
    this.bindNumericConfig(selectMaxSpeed, value => (this.config.MAX_SPEED = value));
    this.bindNumericConfig(selectPolygonTargetSpacing, value => (this.config.POLYGON_TARGET_SPACING = value));
    this.bindNumericConfig(selectPolygonStrength, value => (this.config.POLYGON_STRENGTH = value));
  }

  private bindWindowEvents(): void {
    this.subscriptions.add(
      fromEvent(window, 'resize')
        .pipe(debounceTime(200))
        .subscribe(() => this.handleResize(false))
    );

    this.subscriptions.add(
      fromEvent(window, 'scroll')
        .pipe(debounceTime(40))
        .subscribe(() => this.pauseForScroll())
    );

    this.subscriptions.add(
      fromEvent(window, 'blur').subscribe(() => {
        this.wasRunningBeforeBlur = this.isRunning;
        this.stopAnimation();
      })
    );

    this.subscriptions.add(
      fromEvent(window, 'focus').subscribe(() => {
        if (this.wasRunningBeforeBlur && this.isAnimationEnabled) {
          this.startAnimation();
          this.wasRunningBeforeBlur = false;
        }
      })
    );
  }

  private bindNumericConfig(selector: MemoizedSelector<object, number>, assign: (value: number) => void): void {
    this.subscriptions.add(
      this.store.select(selector).subscribe(value => {
        assign(value as number);
        this.renderStaticFrameIfPaused();
      })
    );
  }

  private startAnimation(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.ngZone.runOutsideAngular(() => {
      this.animationId = requestAnimationFrame(this.animate);
    });
  }

  private stopAnimation(): void {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = 0;
    }
  }

  private pauseForScroll(): void {
    if (!this.isAnimationEnabled) {
      return;
    }

    this.stopAnimation();
    if (this.scrollPauseTimeout) {
      clearTimeout(this.scrollPauseTimeout);
    }

    this.scrollPauseTimeout = setTimeout(() => {
      if (this.isAnimationEnabled) {
        this.startAnimation();
      }
    }, 150);
  }

  private handleResize(forceReinitialize: boolean): void {
    const previousArea = this.viewportWidth * this.viewportHeight;

    this.viewportWidth = document.documentElement.clientWidth;
    this.viewportHeight = document.documentElement.clientHeight;
    this.devicePixelRatio = window.devicePixelRatio || 1;

    const canvas = this.canvasRef.nativeElement;
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.width = Math.max(1, Math.floor(this.viewportWidth * this.devicePixelRatio));
    canvas.height = Math.max(1, Math.floor(this.viewportHeight * this.devicePixelRatio));

    this.ctx.setTransform(this.devicePixelRatio, 0, 0, this.devicePixelRatio, 0, 0);

    const currentArea = this.viewportWidth * this.viewportHeight;
    const relativeDelta = previousArea > 0 ? Math.abs(currentArea - previousArea) / previousArea : 1;
    const shouldReinitialize = forceReinitialize || this.points.length === 0 || relativeDelta > 0.2;

    if (shouldReinitialize) {
      this.initPoints();
    } else {
      this.clampPointsToViewport();
      const newCount = this.computeActualNumPoints();
      if (newCount !== this.points.length) {
        this.adjustParticleCount(newCount);
      }
    }

    if (!this.isAnimationEnabled) {
      this.renderStaticFrame();
    }
  }

  private initPoints(): void {
    this.points = Array.from({ length: this.computeActualNumPoints() }, (_, index) => this.createRandomPoint(index));
    this.collectConnections(false);
  }

  private createRandomPoint(index: number): Point {
    const angle = Math.random() * Math.PI * 2;
    const speedRange = Math.max(0, this.config.MAX_SPEED - this.config.MIN_SPEED);
    const speed = Math.max(this.config.MIN_SPEED, this.config.MIN_SPEED + Math.random() * speedRange);

    return {
      x: Math.random() * this.viewportWidth,
      y: Math.random() * this.viewportHeight,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: index % 2 === 0 ? this.config.COLORS.ORANGE : this.config.COLORS.PURPLE,
      connections: 0
    };
  }

  private recolorPoints(): void {
    for (let i = 0; i < this.points.length; i++) {
      this.points[i].color = i % 2 === 0 ? this.config.COLORS.ORANGE : this.config.COLORS.PURPLE;
    }
  }

  private adjustParticleCount(newCount: number): void {
    if (newCount > this.points.length) {
      const start = this.points.length;
      for (let i = start; i < newCount; i++) {
        this.points.push(this.createRandomPoint(i));
      }
      return;
    }

    if (newCount < this.points.length) {
      this.points = this.points.slice(0, newCount);
    }
  }

  private clampPointsToViewport(): void {
    for (const point of this.points) {
      point.x = Math.min(this.viewportWidth, Math.max(0, point.x));
      point.y = Math.min(this.viewportHeight, Math.max(0, point.y));
    }
  }

  private animate = (timestamp: number): void => {
    if (!this.ctx || !this.isRunning || !this.isAnimationEnabled) {
      return;
    }

    try {
      const deltaMs = timestamp - this.lastFrameTime;
      this.lastFrameTime = timestamp;
      this.currentTimeMs = timestamp;
      this.frameCount++;

      const deltaTime = Math.max(0.1, Math.min(3, deltaMs / 16.67));
      this.updatePoints(deltaTime);
      this.drawFrame();

      this.animationId = requestAnimationFrame(this.animate);
    } catch (error) {
      this.errorHandler.handleError(error);
      this.stopAnimation();
    }
  };

  private updatePoints(deltaTime: number): void {
    this.collectConnections(true);

    for (const point of this.points) {
      if (this.enableBrownianMotion) {
        this.physicsService.applyBrownianMotion(point, this.config.BROWNIAN_STRENGTH);
      }

      point.x += point.vx * deltaTime;
      point.y += point.vy * deltaTime;

      this.handleBoundaryCollision(point);

      if (this.enableDamping) {
        this.physicsService.applyDamping(point, this.config.DAMPING_FACTOR);
      }

      this.physicsService.constrainSpeed(point, this.config.MIN_SPEED, this.config.MAX_SPEED);
    }
  }

  private collectConnections(applyForces: boolean): void {
    const quadTree = new QuadTree({
      x: 0,
      y: 0,
      width: this.viewportWidth,
      height: this.viewportHeight
    });
    const pointIndex = new Map<Point, number>();

    this.connectionPairs = [];
    this.points.forEach((point, index) => {
      point.connections = 0;
      pointIndex.set(point, index);
      quadTree.insert(point);
    });

    const connectionRadius = this.config.CONNECTION_RADIUS;
    const searchDiameter = connectionRadius * 2;

    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i];
      const nearbyPoints = quadTree.query({
        x: point.x - connectionRadius,
        y: point.y - connectionRadius,
        width: searchDiameter,
        height: searchDiameter
      });

      for (const otherPoint of nearbyPoints) {
        const otherIndex = pointIndex.get(otherPoint);
        if (otherIndex === undefined || otherIndex <= i) {
          continue;
        }

        const distance = this.physicsService.getDistance(point, otherPoint);
        if (distance >= connectionRadius) {
          continue;
        }

        point.connections++;
        otherPoint.connections++;
        this.connectionPairs.push({ point, otherPoint, distance });

        if (applyForces) {
          this.applyPairForces(point, otherPoint, i, otherIndex, distance);
        }
      }
    }

    if (this.enableCooldownAttraction) {
      this.cooldownCleanupCounter++;
      if (this.cooldownCleanupCounter >= 60) {
        this.cleanupCooldownMap();
        this.cooldownCleanupCounter = 0;
      }
    }
  }

  private applyPairForces(point: Point, otherPoint: Point, i: number, j: number, distance: number): void {
    if (this.enableRepulsionForce && distance < this.config.REPULSION_RADIUS) {
      this.physicsService.applyRepulsionForce(
        point,
        otherPoint,
        distance,
        this.config.REPULSION_RADIUS,
        this.config.REPULSION_STRENGTH
      );
    } else if (this.enableMagneticForce && distance < this.config.MAGNETIC_RADIUS) {
      if (this.enableCooldownAttraction) {
        this.applyCooldownMagneticForce(point, otherPoint, i, j, distance);
      } else {
        this.physicsService.applyMagneticForce(
          point,
          otherPoint,
          distance,
          this.config.MAGNETIC_RADIUS,
          this.config.MAGNETIC_STRENGTH
        );
      }
    }

    if (this.enablePolygonStabilizer) {
      this.physicsService.applyPolygonStabilizer(
        point,
        otherPoint,
        distance,
        this.config.POLYGON_TARGET_SPACING,
        this.config.POLYGON_STRENGTH
      );
    }
  }

  private applyCooldownMagneticForce(point: Point, otherPoint: Point, i: number, j: number, distance: number): void {
    const pairKey = `${Math.min(i, j)}-${Math.max(i, j)}`;
    const now = performance.now();
    const cooldownEnd = this.cooldownMap.get(pairKey);

    if (distance < this.cooldownMinDistance) {
      if (!cooldownEnd || now >= cooldownEnd) {
        this.cooldownMap.set(pairKey, now + this.cooldownDuration);
      }
      return;
    }

    if (cooldownEnd !== undefined) {
      if (now < cooldownEnd && distance < this.cooldownResetDistance) {
        return;
      }
      this.cooldownMap.delete(pairKey);
    }

    this.physicsService.applyMagneticForce(
      point,
      otherPoint,
      distance,
      this.config.MAGNETIC_RADIUS,
      this.config.MAGNETIC_STRENGTH
    );
  }

  private cleanupCooldownMap(): void {
    const now = performance.now();
    for (const [key, endTime] of this.cooldownMap) {
      if (now >= endTime) {
        this.cooldownMap.delete(key);
      }
    }
  }

  private handleBoundaryCollision(point: Point): void {
    const margin = this.config.POINTS_SIZE;

    if (point.x - margin < 0) {
      point.x = margin;
      point.vx = Math.abs(point.vx) * this.BOUNCE_COEFFICIENT;
    } else if (point.x + margin > this.viewportWidth) {
      point.x = this.viewportWidth - margin;
      point.vx = -Math.abs(point.vx) * this.BOUNCE_COEFFICIENT;
    }

    if (point.y - margin < 0) {
      point.y = margin;
      point.vy = Math.abs(point.vy) * this.BOUNCE_COEFFICIENT;
    } else if (point.y + margin > this.viewportHeight) {
      point.y = this.viewportHeight - margin;
      point.vy = -Math.abs(point.vy) * this.BOUNCE_COEFFICIENT;
    }

    const speed = Math.hypot(point.vx, point.vy);
    if (speed < this.config.MIN_SPEED) {
      if (speed <= this.EPSILON) {
        const angle = Math.random() * Math.PI * 2;
        point.vx = Math.cos(angle) * this.config.MIN_SPEED;
        point.vy = Math.sin(angle) * this.config.MIN_SPEED;
      } else {
        const scale = this.config.MIN_SPEED / speed;
        point.vx *= scale;
        point.vy *= scale;
      }
    }
  }

  private renderStaticFrameIfPaused(): void {
    if (!this.isAnimationEnabled) {
      this.renderStaticFrame();
    }
  }

  private renderStaticFrame(): void {
    this.collectConnections(false);
    this.drawFrame();
  }

  private drawFrame(): void {
    this.ctx.clearRect(0, 0, this.viewportWidth, this.viewportHeight);
    this.drawConnections();
    this.drawPoints();
  }

  private drawConnections(): void {
    for (const { point, otherPoint, distance } of this.connectionPairs) {
      if (!this.isInViewport(point) && !this.isInViewport(otherPoint)) {
        continue;
      }
      this.drawConnection(point, otherPoint, distance);
    }
  }

  private drawConnection(point: Point, otherPoint: Point, distance: number): void {
    this.withCanvasState(() => {
      const totalConnections = point.connections + otherPoint.connections;
      const weight = totalConnections > 0 ? point.connections / totalConnections : 0.5;
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
      this.ctx.globalAlpha = Math.max(0, 1 - distance / this.config.CONNECTION_RADIUS);
      this.ctx.stroke();
    });
  }

  private drawPoints(): void {
    for (const point of this.points) {
      if (!this.isInViewport(point)) {
        continue;
      }

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
    }
  }

  private withCanvasState(callback: () => void): void {
    this.ctx.save();
    callback();
    this.ctx.restore();
  }

  private isInViewport(point: Point): boolean {
    const margin = this.config.CONNECTION_RADIUS;
    return (
      point.x + margin >= 0 &&
      point.x - margin <= this.viewportWidth &&
      point.y + margin >= 0 &&
      point.y - margin <= this.viewportHeight
    );
  }

  private hexToRgb(hex: string): RGB {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
      return { r: 0, g: 0, b: 0 };
    }

    return {
      r: Number.parseInt(result[1], 16),
      g: Number.parseInt(result[2], 16),
      b: Number.parseInt(result[3], 16)
    };
  }

  private blendColors(color1: string, color2: string, weight: number): string {
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);
    const clampedWeight = Math.max(0, Math.min(1, weight));

    const r = Math.round(c1.r * clampedWeight + c2.r * (1 - clampedWeight));
    const g = Math.round(c1.g * clampedWeight + c2.g * (1 - clampedWeight));
    const b = Math.round(c1.b * clampedWeight + c2.b * (1 - clampedWeight));

    return `rgb(${r},${g},${b})`;
  }
}

