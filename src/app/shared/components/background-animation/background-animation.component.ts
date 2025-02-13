// components/background-animation.component.ts
import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
  PLATFORM_ID,
  Inject,
  ErrorHandler,
  NgZone
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import {
  Point,
  RGB,
  ANIMATION_CONSTANTS,
  AnimationConfig
} from '../../../models/animation.constants';
import { QuadTree } from '../../../utils/quad-tree';

@Component({
  selector: 'app-background-animation',
  standalone: true,
  template: `
    <canvas #canvas
      class="fixed top-0 left-0 w-full h-full"
      [attr.aria-label]="'Background animation'"
    ></canvas>
  `
})
export class BackgroundAnimationComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true })
  private readonly canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private points: Point[] = [];
  private animationId: number = 0;
  private isRunning = false;
  private lastFrameTime: number = 0;
  private resizeSubscription?: Subscription;

  private readonly config: AnimationConfig = {
    showBorder: false,
    glowPoints: true,
    glowLines: false,
    ...ANIMATION_CONSTANTS
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone,
    private errorHandler: ErrorHandler
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      this.initializeCanvas();

      this.resizeSubscription = fromEvent(window, 'resize')
        .pipe(debounceTime(250))
        .subscribe(this.handleResize);

      // Run animation outside Angular's zone for better performance
      this.ngZone.runOutsideAngular(() => {
        this.animate(performance.now());
      });
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
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

    // Set display size
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    // Set actual size in memory
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    // Scale context to ensure correct drawing operations
    this.ctx.scale(dpr, dpr);

    // Only reinitialize points if necessary
    if (this.points.length === 0) {
      this.initPoints();
    }
  };

  private initPoints(): void {
    const canvas = this.canvasRef.nativeElement;
    this.points = Array.from({ length: this.config.NUM_POINTS }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      color: i % 2 === 0 ? this.config.COLORS.BLUE : this.config.COLORS.PURPLE,
      connections: 0
    }));
  }

  private animate = (timestamp: number): void => {
    if (!this.ctx || !this.isRunning) return;

    try {
      const deltaTime = timestamp - this.lastFrameTime;
      this.lastFrameTime = timestamp;

      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);

      // Update and draw
      this.updatePoints(deltaTime / 16.67);
      this.drawScene();

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
      // Find nearby points using quadtree
      const searchBounds = {
        x: point.x - this.config.CONNECTION_RADIUS,
        y: point.y - this.config.CONNECTION_RADIUS,
        width: this.config.CONNECTION_RADIUS * 2,
        height: this.config.CONNECTION_RADIUS * 2
      };

      const nearbyPoints = quadTree.query(searchBounds);

      // Update interactions with nearby points
      nearbyPoints.forEach(otherPoint => {
        if (point === otherPoint) return;

        const distance = this.getDistance(point, otherPoint);
        if (distance < this.config.CONNECTION_RADIUS) {
          point.connections++;
          otherPoint.connections++;
          this.applyMagneticEffect(point, otherPoint);
        }
      });

      // Update position
      point.x += point.vx * deltaTime;
      point.y += point.vy * deltaTime;

      this.keepPointMoving(point);
      this.handleBoundaryCollision(point, canvas);
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

  private drawConnections(): void {
    this.points.forEach((point, i) => {
      if (!this.isInViewport(point)) return;

      this.points.slice(i + 1).forEach(otherPoint => {
        if (!this.isInViewport(otherPoint)) return;

        const distance = this.getDistance(point, otherPoint);
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

  private getDistance(point1: Point, point2: Point): number {
    return Math.hypot(point2.x - point1.x, point2.y - point1.y);
  }

  private applyMagneticEffect(point: Point, otherPoint: Point): void {
    const dx = otherPoint.x - point.x;
    const dy = otherPoint.y - point.y;
    const distance = Math.hypot(dx, dy);

    if (distance < this.config.MAGNETIC_RADIUS && distance > 0) {
      const force = (1 - distance / this.config.MAGNETIC_RADIUS) * this.config.MAGNETIC_STRENGTH;
      const dirX = dx / distance;
      const dirY = dy / distance;

      point.vx += dirX * force;
      point.vy += dirY * force;
      otherPoint.vx -= dirX * force;
      otherPoint.vy -= dirY * force;
    }
  }

  private keepPointMoving(point: Point): void {
    const speed = Math.hypot(point.vx, point.vy);

    if (speed < this.config.MIN_SPEED) {
      const angle = Math.random() * Math.PI * 2;
      point.vx = Math.cos(angle) * this.config.MIN_SPEED;
      point.vy = Math.sin(angle) * this.config.MIN_SPEED;
    } else if (speed > this.config.MAX_SPEED) {
      const scale = this.config.MAX_SPEED / speed;
      point.vx *= scale;
      point.vy *= scale;
    }
  }
}
