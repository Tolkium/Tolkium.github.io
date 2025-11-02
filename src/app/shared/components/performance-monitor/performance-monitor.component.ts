import { 
  Component, 
  OnInit, 
  OnDestroy, 
  ChangeDetectionStrategy,
  ElementRef,
  viewChild,
  inject,
  NgZone,
  PLATFORM_ID,
  effect,
  computed,
  signal,
  untracked,
  DestroyRef
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { PerformanceMonitorService } from '../../../core/services/performance-monitor.service';
import { togglePerformanceMonitor } from '../../../core/store/ui.actions';
import { selectPerformanceMonitorThemeColor, selectIsDarkMode } from '../../../core/store/ui.selectors';

interface ChartConfig {
  ref: ReturnType<typeof viewChild<ElementRef<HTMLCanvasElement>>>;
  getData: () => Array<{ timestamp: number; value: number }>;
  color: string | (() => string);
  minValue: number;
  getMaxValue: () => number;
}

interface DragCleanup {
  cleanup: () => void;
}

interface OverlayWithCleanup extends HTMLDivElement {
  __dragCleanup?: DragCleanup;
}

const PERF_HEADER_SELECTOR = '.perf-header';

@Component({
  selector: 'app-performance-monitor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './performance-monitor.component.html',
  styleUrls: ['./performance-monitor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerformanceMonitorComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly perfService = inject(PerformanceMonitorService);
  private readonly ngZone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  // View queries
  private readonly fpsChartRef = viewChild<ElementRef<HTMLCanvasElement>>('fpsChart');
  private readonly memoryChartRef = viewChild<ElementRef<HTMLCanvasElement>>('memoryChart');
  private readonly cpuChartRef = viewChild<ElementRef<HTMLCanvasElement>>('cpuChart');
  private readonly changeDetectionChartRef = viewChild<ElementRef<HTMLCanvasElement>>('changeDetectionChart');
  private readonly overlayRef = viewChild<ElementRef<HTMLDivElement>>('overlay');

  // State signals
  public readonly metrics = toSignal(this.perfService.metrics$, { initialValue: null });
  public readonly isMinimized = signal(false);
  public readonly isDarkMode = toSignal(this.store.select(selectIsDarkMode), { initialValue: true });
  public readonly themeColor = toSignal(this.store.select(selectPerformanceMonitorThemeColor), { initialValue: '#c77dff' });

  // Computed values
  public readonly performanceStatus = computed<'good' | 'warning' | 'critical'>(() => 
    this.perfService.getPerformanceStatus()
  );

  public readonly statusColor = computed(() => {
    switch (this.performanceStatus()) {
      case 'good': return '#10b981';
      case 'warning': return '#f59e0b';
      default: return '#ef4444';
    }
  });

  public readonly hardwareConcurrency = computed(() => {
    if (!isPlatformBrowser(this.platformId)) return 0;
    return navigator.hardwareConcurrency || 0;
  });

  // Internal state
  private chartsInitialized = false;
  private draggingInitialized = false;
  private readonly isDragging = signal(false);
  private dragState = { startX: 0, startY: 0, initialX: 0, initialY: 0 };

  // Initialize component when overlay is available
  private readonly initEffect = effect(() => {
    const overlay = this.overlayRef()?.nativeElement;
    if (!isPlatformBrowser(this.platformId) || !overlay) return;

    untracked(() => {
      this.initializeComponent(overlay);
    });
  });

  // Update charts when metrics or theme changes
  private readonly chartUpdateEffect = effect(() => {
    const metrics = this.metrics();
    const themeColor = this.themeColor();
    
    if (!isPlatformBrowser(this.platformId) || !metrics || !this.chartsInitialized) return;
    
    untracked(() => {
      this.ngZone.runOutsideAngular(() => {
        requestAnimationFrame(() => this.updateAllCharts());
      });
    });
  });

  // Apply theme color changes
  private readonly themeEffect = effect(() => {
    const themeColor = this.themeColor();
    const overlay = this.overlayRef()?.nativeElement;
    
    if (!isPlatformBrowser(this.platformId) || !overlay) return;

    untracked(() => {
      this.applyThemeColor(overlay, themeColor);
    });
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.perfService.startMonitoring();
    }
  }

  ngOnDestroy(): void {
    this.perfService.stopMonitoring();
    this.cleanupDragging();
  }

  private initializeComponent(overlay: HTMLDivElement): void {
    if (!this.draggingInitialized) {
      this.setupDragging(overlay);
      this.draggingInitialized = true;
    }
    
    if (!this.chartsInitialized) {
      this.loadAndInitializeCharts();
      this.chartsInitialized = true;
    }
  }

  private async loadAndInitializeCharts(): Promise<void> {
    try {
      await import('uplot');
      this.ngZone.runOutsideAngular(() => {
        requestAnimationFrame(() => this.updateAllCharts());
      });
    } catch (error) {
      // Silently handle uplot loading failure - component works without it
      if (typeof error === 'object' && error !== null && 'message' in error) {
        console.warn('[PerformanceMonitor] Chart library not available:', (error as Error).message);
      }
    }
  }

  private updateAllCharts(): void {
    const metrics = this.metrics();
    if (!metrics) return;

    const charts: ChartConfig[] = [
      {
        ref: this.fpsChartRef,
        getData: () => this.perfService.getFPSHistory(),
        color: () => this.themeColor(),
        minValue: 0,
        getMaxValue: () => 165
      },
      {
        ref: this.memoryChartRef,
        getData: () => this.perfService.getMemoryHistory(),
        color: '#f29f67',
        minValue: 0,
        getMaxValue: () => metrics.memory?.limitMB ?? 100
      },
      {
        ref: this.cpuChartRef,
        getData: () => this.perfService.getCPUHistory(),
        color: '#00ffff',
        minValue: 0,
        getMaxValue: () => 100
      },
      {
        ref: this.changeDetectionChartRef,
        getData: () => this.perfService.getChangeDetectionHistory(),
        color: () => this.themeColor(),
        minValue: 0,
        getMaxValue: () => {
          const data = this.perfService.getChangeDetectionHistory();
          return Math.max(...data.map(d => d.value), 100);
        }
      }
    ];

    for (const chart of charts) {
      this.renderChart(chart);
    }
  }

  private renderChart(config: ChartConfig): void {
    const chartRef = config.ref();
    if (!chartRef) return;

    const canvas = chartRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = config.getData();
    const color = typeof config.color === 'function' ? config.color() : config.color;
    const maxValue = config.getMaxValue();

    this.drawChart(ctx, canvas, data, color, config.minValue, maxValue);
  }

  private drawChart(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    data: Array<{ timestamp: number; value: number }>,
    color: string,
    minValue: number,
    maxValue: number
  ): void {
    const { width, height } = canvas;
    const padding = 2;

    ctx.clearRect(0, 0, width, height);
    if (data.length < 2) return;

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, `${color}33`);
    gradient.addColorStop(1, `${color}00`);

    // Draw line path
    const stepX = width / (data.length - 1);
    const range = maxValue - minValue || 1;

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

    // Fill area
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  private setupDragging(overlay: HTMLDivElement): void {
    const header = overlay.querySelector<HTMLElement>(PERF_HEADER_SELECTOR);
    if (!header) return;

    header.style.cursor = 'move';

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // Only left mouse button
      
      this.isDragging.set(true);
      this.dragState.startX = e.clientX;
      this.dragState.startY = e.clientY;
      
      const rect = overlay.getBoundingClientRect();
      this.dragState.initialX = rect.left;
      this.dragState.initialY = rect.top;
      
      e.preventDefault();
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!this.isDragging()) return;
      
      const deltaX = e.clientX - this.dragState.startX;
      const deltaY = e.clientY - this.dragState.startY;
      
      overlay.style.left = `${this.dragState.initialX + deltaX}px`;
      overlay.style.top = `${this.dragState.initialY + deltaY}px`;
      overlay.style.right = 'auto';
    };

    const handleMouseUp = () => {
      this.isDragging.set(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    header.addEventListener('mousedown', handleMouseDown);
    
    // Store for cleanup with proper typing
    const cleanup: DragCleanup = {
      cleanup: () => {
        header.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      }
    };
    
    (overlay as OverlayWithCleanup).__dragCleanup = cleanup;
    
    // Auto-cleanup on destroy
    this.destroyRef.onDestroy(() => {
      cleanup.cleanup();
    });
  }

  private cleanupDragging(): void {
    const overlay = this.overlayRef()?.nativeElement as OverlayWithCleanup | undefined;
    overlay?.__dragCleanup?.cleanup();
  }

  public close(): void {
    this.store.dispatch(togglePerformanceMonitor());
  }

  public toggleMinimize(): void {
    this.isMinimized.update(value => !value);
  }

  public formatBytes(bytes: number): string {
    return `${bytes.toFixed(1)} MB`;
  }

  public formatPercent(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  private applyThemeColor(overlay: HTMLDivElement, color: string): void {
    // Validate hex color format
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return;
    }
    
    // Convert hex to RGB
    const r = Number.parseInt(color.slice(1, 3), 16);
    const g = Number.parseInt(color.slice(3, 5), 16);
    const b = Number.parseInt(color.slice(5, 7), 16);
    
    overlay.style.setProperty('--theme-color', color);
    overlay.style.setProperty('--theme-color-rgb', `${r}, ${g}, ${b}`);
  }
}



