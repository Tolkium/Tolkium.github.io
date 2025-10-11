import { 
  Component, 
  OnInit, 
  OnDestroy, 
  ChangeDetectionStrategy, 
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
  AfterViewInit,
  inject,
  NgZone,
  PLATFORM_ID,
  Renderer2
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { PerformanceMonitorService, PerformanceMetrics } from '../../../core/services/performance-monitor.service';
import { togglePerformanceMonitor } from '../../../core/store/ui.actions';
import { selectPerformanceMonitorThemeColor, selectIsDarkMode } from '../../../core/store/ui.selectors';

@Component({
  selector: 'app-performance-monitor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './performance-monitor.component.html',
  styleUrls: ['./performance-monitor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerformanceMonitorComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly store = inject(Store);
  private readonly perfService = inject(PerformanceMonitorService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly renderer = inject(Renderer2);

  @ViewChild('fpsChart', { static: false }) fpsChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('memoryChart', { static: false }) memoryChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('cpuChart', { static: false }) cpuChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('changeDetectionChart', { static: false }) changeDetectionChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('overlay', { static: false }) overlayRef?: ElementRef<HTMLDivElement>;

  public metrics: PerformanceMetrics | null = null;
  public isMinimized = false;
  public isCollapsed = false;
  public themeColor = '#c77dff';
  public isDarkMode = true; // Default to dark mode
  
  public showFPSChart = true;
  public showMemoryChart = true;
  public showCPUChart = true;

  private subscription?: Subscription;
  private darkModeSubscription?: Subscription;
  private uplotInstance: any = null;
  private uplotLoaded = false;

  // Dragging
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private initialX = 0;
  private initialY = 0;

  public get performanceStatus(): 'good' | 'warning' | 'critical' {
    return this.perfService.getPerformanceStatus();
  }

  public get statusColor(): string {
    const status = this.performanceStatus;
    if (status === 'good') return '#10b981'; // green
    if (status === 'warning') return '#f59e0b'; // orange
    return '#ef4444'; // red
  }

  public get hardwareConcurrency(): number {
    return navigator.hardwareConcurrency || 0;
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.perfService.startMonitoring();
    
    this.subscription = this.perfService.metrics$.subscribe(metrics => {
      if (metrics) {
        this.metrics = metrics;
        this.cdr.markForCheck();
        
        // Update charts if loaded
        if (this.uplotLoaded) {
          this.updateCharts();
        }
      }
    });

    // Subscribe to dark mode changes immediately
    this.darkModeSubscription = this.store.select(selectIsDarkMode).subscribe(isDark => {
      this.isDarkMode = isDark;
      this.cdr.markForCheck();
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    // Lazy load uplot when component is rendered
    this.loadUplot();
    
    // Set up dragging
    this.setupDragging();

    // Apply initial theme color and subscribe to changes
    this.ngZone.runOutsideAngular(() => {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        // Subscribe to theme color changes
        this.store.select(selectPerformanceMonitorThemeColor).subscribe(color => {
          console.log('[PerfMonitor] Theme color from store:', color);
          this.themeColor = color;
          this.applyThemeColor(color);
          this.cdr.markForCheck();
        });
      }, 100);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.darkModeSubscription?.unsubscribe();
    this.perfService.stopMonitoring();
    
    if (this.uplotInstance) {
      this.uplotInstance.destroy();
    }
  }

  private async loadUplot(): Promise<void> {
    try {
      // Dynamic import for lazy loading
      const uPlot = await import('uplot');
      const uPlotModule = (uPlot as any).default || uPlot;
      
      this.uplotLoaded = true;
      this.ngZone.runOutsideAngular(() => {
        this.initializeCharts(uPlotModule);
      });
    } catch (error) {
      console.error('Failed to load uplot:', error);
    }
  }

  private initializeCharts(uPlot: any): void {
    // Initialize charts with uPlot
    // For simplicity, we'll use canvas-based mini charts instead
    setTimeout(() => {
      this.renderMiniCharts();
    }, 100);
  }

  private renderMiniCharts(): void {
    this.renderFPSChart();
    this.renderMemoryChart();
    this.renderCPUChart();
    this.renderChangeDetectionChart();
  }

  private updateCharts(): void {
    this.renderFPSChart();
    this.renderMemoryChart();
    this.renderCPUChart();
    this.renderChangeDetectionChart();
  }

  private renderFPSChart(): void {
    if (!this.fpsChartRef) return;
    
    const canvas = this.fpsChartRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = this.perfService.getFPSHistory();
    this.renderChart(ctx, canvas, data, this.themeColor, 0, 165);
  }

  private renderMemoryChart(): void {
    if (!this.memoryChartRef) return;
    
    const canvas = this.memoryChartRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = this.perfService.getMemoryHistory();
    const maxMem = this.metrics?.memory?.limitMB || 100;
    this.renderChart(ctx, canvas, data, '#f29f67', 0, maxMem);
  }

  private renderCPUChart(): void {
    if (!this.cpuChartRef) return;
    
    const canvas = this.cpuChartRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = this.perfService.getCPUHistory();
    // CPU uses cyan for differentiation
    this.renderChart(ctx, canvas, data, '#00ffff', 0, 100);
  }

  private renderChangeDetectionChart(): void {
    if (!this.changeDetectionChartRef) return;
    
    const canvas = this.changeDetectionChartRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = this.perfService.getChangeDetectionHistory();
    const maxCycles = Math.max(...data.map(d => d.value), 100);
    // Use theme color for change detection chart
    this.renderChart(ctx, canvas, data, this.themeColor, 0, maxCycles);
  }

  private renderChart(
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement, 
    data: { timestamp: number, value: number }[],
    color: string,
    minValue: number,
    maxValue: number
  ): void {
    const width = canvas.width;
    const height = canvas.height;
    const padding = 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (data.length < 2) return;

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, `${color}33`);
    gradient.addColorStop(1, `${color}00`);

    // Draw line with glow effect
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 8;
    ctx.shadowColor = color;

    const stepX = width / (data.length - 1);
    
    data.forEach((point, index) => {
      const x = index * stepX;
      const normalizedValue = (point.value - minValue) / (maxValue - minValue);
      const y = height - (normalizedValue * (height - padding * 2)) - padding;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
    ctx.shadowBlur = 0;

    // Fill area under line
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  private setupDragging(): void {
    if (!this.overlayRef) return;
    
    const overlay = this.overlayRef.nativeElement;
    const header = overlay.querySelector('.perf-header') as HTMLElement;
    
    if (!header) return;

    header.style.cursor = 'move';

    const onMouseDown = (e: MouseEvent) => {
      this.isDragging = true;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      
      const rect = overlay.getBoundingClientRect();
      this.initialX = rect.left;
      this.initialY = rect.top;
      
      e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!this.isDragging) return;
      
      const deltaX = e.clientX - this.dragStartX;
      const deltaY = e.clientY - this.dragStartY;
      
      overlay.style.left = `${this.initialX + deltaX}px`;
      overlay.style.top = `${this.initialY + deltaY}px`;
      overlay.style.right = 'auto';
    };

    const onMouseUp = () => {
      this.isDragging = false;
    };

    header.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  public close(): void {
    this.store.dispatch(togglePerformanceMonitor());
  }

  public toggleMinimize(): void {
    this.isMinimized = !this.isMinimized;
  }

  public formatBytes(bytes: number): string {
    return `${bytes.toFixed(1)} MB`;
  }

  public formatPercent(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  private applyThemeColor(color: string): void {
    if (!this.overlayRef) {
      console.error('[PerfMonitor] Overlay ref not available yet');
      return;
    }
    
    const overlay = this.overlayRef.nativeElement;
    
    // Convert hex to RGB for CSS variables
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    console.log(`[PerfMonitor] ===== APPLYING THEME COLOR =====`);
    console.log(`[PerfMonitor] Color: ${color}`);
    console.log(`[PerfMonitor] RGB: (${r}, ${g}, ${b})`);
    console.log(`[PerfMonitor] Overlay element:`, overlay);
    
    // Set CSS variables directly on the element style
    overlay.style.setProperty('--theme-color', color);
    overlay.style.setProperty('--theme-color-rgb', `${r}, ${g}, ${b}`);
    
    // Verify the variables were set
    const computedStyle = getComputedStyle(overlay);
    const themeColor = computedStyle.getPropertyValue('--theme-color');
    const themeColorRgb = computedStyle.getPropertyValue('--theme-color-rgb');
    
    console.log(`[PerfMonitor] Computed --theme-color: "${themeColor}"`);
    console.log(`[PerfMonitor] Computed --theme-color-rgb: "${themeColorRgb}"`);
    console.log(`[PerfMonitor] ===================================`);
    
    // Re-render charts with new color
    if (this.uplotLoaded) {
      this.ngZone.runOutsideAngular(() => {
        setTimeout(() => this.updateCharts(), 50);
      });
    }
  }
}

