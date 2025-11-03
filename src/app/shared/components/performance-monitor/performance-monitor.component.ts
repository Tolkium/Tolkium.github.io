import { 
  Component, 
  OnInit, 
  OnDestroy, 
  ChangeDetectionStrategy, 
  inject,
  computed,
  signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { PerformanceMonitorService } from '../../../core/services/performance-monitor.service';
import { togglePerformanceMonitor } from '../../../core/store/ui.actions';
import { selectPerformanceMonitorThemeColor, selectIsDarkMode } from '../../../core/store/ui.selectors';
import { ChartDirective } from './directives/chart.directive';
import { DraggableDirective } from './directives/draggable.directive';

@Component({
  selector: 'app-performance-monitor',
  standalone: true,
  imports: [CommonModule, ChartDirective, DraggableDirective],
  templateUrl: './performance-monitor.component.html',
  styleUrls: ['./performance-monitor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerformanceMonitorComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly perfService = inject(PerformanceMonitorService);

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
    if (typeof navigator === 'undefined') return 0;
    return navigator.hardwareConcurrency || 0;
  });

  // Computed chart data signals for directives
  // These depend on metrics() signal so they update when new data arrives
  public readonly fpsChartData = computed(() => {
    // Track metrics to trigger recomputation when new data arrives
    this.metrics();
    return this.perfService.getFPSHistory();
  });
  
  public readonly memoryChartData = computed(() => {
    this.metrics();
    return this.perfService.getMemoryHistory();
  });
  
  public readonly cpuChartData = computed(() => {
    this.metrics();
    return this.perfService.getCPUHistory();
  });
  
  public readonly changeDetectionChartData = computed(() => {
    // Track metrics to trigger recomputation when new data arrives
    this.metrics();
    return this.perfService.getChangeDetectionHistory();
    });

  // Computed chart configurations
  public readonly fpsChartMax = computed(() => 165);
  public readonly memoryChartMax = computed(() => this.metrics()?.memory?.limitMB ?? 100);
  public readonly cpuChartMax = computed(() => 100);
  public readonly changeDetectionChartMax = computed(() => {
    // Track metrics to get fresh data
    this.metrics();
    const data = this.perfService.getChangeDetectionHistory();
    return Math.max(...data.map(d => d.value), 100);
  });

  // Theme color as RGB for CSS custom property (used in host binding)
  public readonly themeColorRgb = computed(() => {
    const color = this.themeColor();
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) return '199, 125, 255'; // default
    
    const r = Number.parseInt(color.slice(1, 3), 16);
    const g = Number.parseInt(color.slice(3, 5), 16);
    const b = Number.parseInt(color.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  });

  // Color utility functions
  private hexToHsl(hex: string): { h: number; s: number; l: number } {
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      return { h: 270, s: 100, l: 60 }; // default purple
    }

    const r = Number.parseInt(hex.slice(1, 3), 16) / 255;
    const g = Number.parseInt(hex.slice(3, 5), 16) / 255;
    const b = Number.parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
  }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  private hslToRgbString(h: number, s: number, l: number, alpha?: number): string {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else if (h >= 300 && h < 360) {
      r = c; g = 0; b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    if (alpha !== undefined) {
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return `${r}, ${g}, ${b}`;
  }

  // Calculate background colors based on theme color
  // Creates a theme-aware background that complements the theme
  public readonly backgroundColors = computed(() => {
    const themeHex = this.themeColor();
    const hsl = this.hexToHsl(themeHex);
    const darkMode = this.isDarkMode();

    if (darkMode) {
      // Dark mode: Dark version of theme with adjusted saturation and lightness
      const bgHue = hsl.h;
      const bgSaturation = Math.min(hsl.s * 0.35, 40); // Lower saturation for subtlety
      const bgLightness = 8; // Very dark for professional look
      
      const bgStart = this.hslToRgbString(bgHue, bgSaturation, bgLightness);
      const bgEnd = this.hslToRgbString(bgHue, bgSaturation * 0.7, bgLightness * 0.8);

      // Accent background: Slightly lighter for gradients
      const accentLightness = 12;
      const accentSaturation = bgSaturation * 1.2;
      const accentColor = this.hslToRgbString(bgHue, accentSaturation, accentLightness);

      // Subtle background for cards/sections
      const cardLightness = 15;
      const cardSaturation = bgSaturation * 1.1;
      const cardColor = this.hslToRgbString(bgHue, cardSaturation, cardLightness);

      return {
        bgStart: `rgba(${bgStart}, 0.92)`,
        bgEnd: `rgba(${bgEnd}, 0.9)`,
        accentRgb: accentColor,
        cardRgb: cardColor,
        bgRgb: bgStart // For borders and subtle elements
      };
    } else {
      // Light mode: Light version of theme
      const bgHue = hsl.h;
      const bgSaturation = Math.min(hsl.s * 0.2, 20); // Lower saturation for subtlety
      const bgLightness = 96; // Very light for professional look
      
      const bgStart = this.hslToRgbString(bgHue, bgSaturation, bgLightness);
      const bgEnd = this.hslToRgbString(bgHue, bgSaturation * 0.8, bgLightness * 0.97);

      // Accent background: Slightly darker for gradients
      const accentLightness = 92;
      const accentSaturation = bgSaturation * 1.5;
      const accentColor = this.hslToRgbString(bgHue, accentSaturation, accentLightness);

      // Subtle background for cards/sections
      const cardLightness = 95;
      const cardSaturation = bgSaturation * 1.3;
      const cardColor = this.hslToRgbString(bgHue, cardSaturation, cardLightness);

      return {
        bgStart: `rgba(${bgStart}, 0.95)`,
        bgEnd: `rgba(${bgEnd}, 0.93)`,
        accentRgb: accentColor,
        cardRgb: cardColor,
        bgRgb: bgStart // For borders and subtle elements
      };
    }
  });

  // Helper computed signals for template type safety - always return non-null
  public readonly networkMetrics = computed((): { requestCount: number; transferredKB: number; activeRequests: number } => {
    const m = this.metrics();
    return m?.network ?? { requestCount: 0, transferredKB: 0, activeRequests: 0 };
  });

  public readonly paintMetrics = computed((): { fcp: number | null; lcp: number | null } => {
    const m = this.metrics();
    return m?.paint ?? { fcp: null, lcp: null };
  });

  // Non-null computed signals for metrics (returns default values when null)
  public readonly safeMetrics = computed(() => {
    const m = this.metrics();
    if (!m) {
      return {
        fps: 0,
        memory: null,
        dom: { nodeCount: 0, listenerCount: 0 },
        cpu: { estimatedUsage: 0, longTaskCount: 0, averageFrameTime: 0 },
        angular: {
          changeDetectionCycles: 0,
          changeDetectionTime: 0,
          componentCount: 0,
          zoneTasksExecuted: 0,
          eventListenersTriggered: 0,
          lastRouteChangeTime: 0
        },
        activeEffects: 0,
        currentRoute: '',
        timestamp: 0
      };
    }
    return m;
  });

  ngOnInit(): void {
    this.perfService.startMonitoring();
  }

  ngOnDestroy(): void {
    this.perfService.stopMonitoring();
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

}



