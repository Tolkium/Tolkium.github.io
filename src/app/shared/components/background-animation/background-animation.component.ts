interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  connections: number; // Track number of connections
}

import { Component, ElementRef, OnInit, OnDestroy, ViewChild, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-background-animation',
  standalone: true,
  template: `
    <canvas #canvas
      class="fixed top-0 left-0 w-full h-full"
    ></canvas>

  `
})
export class BackgroundAnimationComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private points: Point[] = [];
  private readonly numPoints = 100;
  private readonly connectionRadius = 250;
  private readonly magneticRadius = 100;
  private readonly magneticStrength = 0.0005;
  private readonly minSpeed = 0.15;
  private readonly maxSpeed = 0.6;
  private readonly pointsSize = 7;
  private readonly lineWidth = 7;
  private showBorder: boolean = false; // Set to true if you want the border enabled by default
  private glowPoints: boolean = true;  // Enable/disable point glow
  private glowLines: boolean = false;   // Enable/disable line glow
  private glowIntensityPoints: number = 5;  // Glow strength for points
  private glowIntensityLines: number = 10;   // Glow strength for lines
  private readonly colors = {
    blue: '#0066cc',
    purple: '#8833cc'
  };
  private animationId: number = 0;
  private resizeHandler: () => void;
  private isRunning = false;
  debugInfo: string = 'Initializing...';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.resizeHandler = () => this.resizeCanvas();
  }

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      this.debugInfo = 'Not in browser';
      return;
    }

    this.debugInfo = 'Starting initialization...';
    this.initializeCanvas();
  }

  private initPoints() {
    const canvas = this.canvasRef.nativeElement;
    this.points = [];
    for (let i = 0; i < this.numPoints; i++) {
      this.points.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        color: i % 2 === 0 ? this.colors.blue : this.colors.purple,
        connections: 0
      });
    }
  }

  private hexToRgb(hex: string): { r: number, g: number, b: number } {
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

  private initializeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    const context = canvas.getContext('2d');

    if (!context) {
      this.debugInfo = 'Failed to get 2D context';
      return;
    }

    this.ctx = context;
    this.resizeCanvas();
    this.initPoints();
    this.isRunning = true;

    this.drawDebugFrame();
    this.animate();
    window.addEventListener('resize', this.resizeHandler);

    this.debugInfo = `Canvas: ${canvas.width}x${canvas.height}, Points: ${this.points.length}`;
  }

  private resizeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.debugInfo = `Resized: ${canvas.width}x${canvas.height}`;
  }


  private applyMagneticEffect(point: Point, otherPoint: Point) {
    const dx = otherPoint.x - point.x;
    const dy = otherPoint.y - point.y;
    const distance = Math.hypot(dx, dy);

    if (distance < this.magneticRadius && distance > 0) {
      // Calculate magnetic force (stronger when closer)
      const force = (1 - distance / this.magneticRadius) * this.magneticStrength;

      // Normalize direction
      const dirX = dx / distance;
      const dirY = dy / distance;

      // Apply magnetic effect to velocity
      point.vx += dirX * force;
      point.vy += dirY * force;
      otherPoint.vx -= dirX * force;
      otherPoint.vy -= dirY * force;
    }
  }

  private keepPointMoving(point: Point) {
    // Calculate current speed
    const speed = Math.hypot(point.vx, point.vy);

    if (speed < this.minSpeed) {
      // If moving too slow, give it a random boost
      const angle = Math.random() * Math.PI * 2;
      point.vx = Math.cos(angle) * this.minSpeed;
      point.vy = Math.sin(angle) * this.minSpeed;
    } else if (speed > this.maxSpeed) {
      // If moving too fast, scale it down
      const scale = this.maxSpeed / speed;
      point.vx *= scale;
      point.vy *= scale;
    }
  }

  private drawDebugFrame() {
    if (!this.ctx) return;

    const canvas = this.canvasRef.nativeElement;

    // Draw border
    // this.ctx.strokeStyle = 'red';
    this.ctx.lineWidth = this.lineWidth;
    // this.ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Draw center marker
    this.ctx.beginPath();
    this.ctx.arc(canvas.width/2, canvas.height/2, 10, 0, Math.PI * 2);
    // this.ctx.fillStyle = 'red';
    this.ctx.fill();
  }

  private animate() {
    if (!this.ctx || !this.isRunning) return;

    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.drawDebugFrame();

    // Reset connection counts
    this.points.forEach(point => point.connections = 0);

    // Apply magnetic effects and count connections
    this.points.forEach((point, i) => {
      this.points.forEach((otherPoint, j) => {
        if (i !== j) {
          const distance = Math.hypot(otherPoint.x - point.x, otherPoint.y - point.y);
          if (distance < this.connectionRadius) {
            point.connections++;
            otherPoint.connections++;
          }
          this.applyMagneticEffect(point, otherPoint);
        }
      });
    });

    // Update and draw points
    this.points.forEach((point, index) => {
      // Update position
      point.x += point.vx;
      point.y += point.vy;

      this.keepPointMoving(point);

      // Bounce off walls
      if (point.x < 0 || point.x > canvas.width) {
        point.vx *= -0.95;
        point.x = Math.max(0, Math.min(point.x, canvas.width));
      }
      if (point.y < 0 || point.y > canvas.height) {
        point.vy *= -0.95;
        point.y = Math.max(0, Math.min(point.y, canvas.height));
      }

      // Draw point with optional glow
      if (this.glowPoints) {
        this.ctx.shadowBlur = this.glowIntensityPoints;
        this.ctx.shadowColor = point.color;
      } else {
        this.ctx.shadowBlur = 0;
      }

      // Draw point
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, this.pointsSize, 0, Math.PI * 2);
      this.ctx.fillStyle = point.color;
      this.ctx.fill();

      // Reset shadow to prevent affecting other elements
      this.ctx.shadowBlur = 0;

      // Draw point number and connection count
      this.ctx.fillStyle = 'black';
      this.ctx.font = '12px Arial';
      // this.ctx.fillText(`${index}(${point.connections})`, point.x + 8, point.y + 8);
    });

// Draw connections with optional glow
this.points.forEach((point, i) => {
  this.points.slice(i + 1).forEach(otherPoint => {
    const distance = Math.hypot(point.x - otherPoint.x, point.y - otherPoint.y);
    if (distance < this.connectionRadius) {
      const totalConnections = point.connections + otherPoint.connections;
      const weight = point.connections / totalConnections;
      const connectionColor = this.blendColors(point.color, otherPoint.color, weight);

      if (this.glowLines) {
        this.ctx.shadowBlur = this.glowIntensityLines;
        this.ctx.shadowColor = connectionColor;
      } else {
        this.ctx.shadowBlur = 0;
      }

      this.ctx.beginPath();
      this.ctx.moveTo(point.x, point.y);
      this.ctx.lineTo(otherPoint.x, otherPoint.y);
      this.ctx.strokeStyle = connectionColor;
      this.ctx.globalAlpha = 1 - (distance / this.connectionRadius);
      this.ctx.stroke();

      this.ctx.shadowBlur = 0; // Reset after drawing
    }
  });
});

    this.ctx.globalAlpha = 1;
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  ngOnDestroy() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }
}
