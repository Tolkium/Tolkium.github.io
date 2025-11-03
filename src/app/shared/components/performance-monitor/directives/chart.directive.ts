import {
  Directive,
  ElementRef,
  input,
  effect,
  inject,
  PLATFORM_ID,
  NgZone
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface ChartDataPoint {
  timestamp: number;
  value: number;
}

@Directive({
  selector: 'canvas[appChart]',
  standalone: true
})
export class ChartDirective {
  private readonly elementRef = inject(ElementRef<HTMLCanvasElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);

  // Signal inputs
  public readonly data = input<ChartDataPoint[]>([]);
  public readonly color = input<string>('#c77dff');
  public readonly minValue = input<number>(0);
  public readonly maxValue = input<number>(100);

  // Render chart when inputs change
  // Track inputs (data, color, minValue, maxValue) so effect runs when they change
  private readonly renderEffect = effect(() => {
    const data = this.data();
    const color = this.color();
    const minValue = this.minValue();
    const maxValue = this.maxValue();

    if (!isPlatformBrowser(this.platformId)) return;

    // Run DOM manipulation outside Angular's change detection
    // Don't use untracked() - we WANT this to react to input changes
    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        this.renderChart(data, color, minValue, maxValue);
      });
    });
  });

  private renderChart(
    data: ChartDataPoint[],
    color: string,
    minValue: number,
    maxValue: number
  ): void {
    const canvas = this.elementRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const padding = 2;

    // Always clear canvas first
    ctx.clearRect(0, 0, width, height);

    // If no data or insufficient data, show empty chart
    if (!data || data.length === 0) return;

    // For single data point, draw a horizontal line
    if (data.length === 1) {
      const point = data[0];
      const normalizedValue = maxValue > minValue ? (point.value - minValue) / (maxValue - minValue) : 0.5;
      const y = height - (normalizedValue * (height - padding * 2)) - padding;
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = color;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      ctx.shadowBlur = 0;
      return;
    }

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, `${color}33`);
    gradient.addColorStop(1, `${color}00`);

    // Draw line path
    const stepX = width / (data.length - 1);
    const range = maxValue > minValue ? maxValue - minValue : 1;

    ctx.beginPath();
    data.forEach((point, index) => {
      const x = index * stepX;
      const normalizedValue = (point.value - minValue) / range;
      const y = height - (normalizedValue * (height - padding * 2)) - padding;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    // Stroke with glow
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 8;
    ctx.shadowColor = color;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Fill area under line
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
  }
}

