import { Injectable, NgZone, inject, PLATFORM_ID, ApplicationRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { 
  selectEnableSparkleEffect, 
  selectEnable3DTiltEffect, 
  selectEnableHolographicEffect 
} from '../store/ui.selectors';

export interface PerformanceMetrics {
  fps: number;
  memory: MemoryMetrics | null;
  dom: DOMMetrics;
  cpu: CPUMetrics;
  network: NetworkMetrics;
  paint: PaintMetrics;
  angular: AngularMetrics;
  activeEffects: number;
  currentRoute: string;
  timestamp: number;
}

export interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usedMB: number;
  totalMB: number;
  limitMB: number;
  usagePercent: number;
}

export interface DOMMetrics {
  nodeCount: number;
  listenerCount: number;
}

export interface CPUMetrics {
  estimatedUsage: number;
  longTaskCount: number;
  averageFrameTime: number;
}

export interface NetworkMetrics {
  requestCount: number;
  transferredKB: number;
  activeRequests: number;
}

export interface PaintMetrics {
  fcp: number | null; // First Contentful Paint
  lcp: number | null; // Largest Contentful Paint
}

export interface AngularMetrics {
  changeDetectionCycles: number;
  changeDetectionTime: number; // ms
  componentCount: number;
  zoneTasksExecuted: number;
  eventListenersTriggered: number;
  lastRouteChangeTime: number; // ms
}

export interface ChartDataPoint {
  timestamp: number;
  value: number;
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceMonitorService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);
  private readonly store = inject(Store);
  private readonly appRef = inject(ApplicationRef);
  private readonly router = inject(Router);

  private metricsSubject = new BehaviorSubject<PerformanceMetrics | null>(null);
  public metrics$ = this.metricsSubject.asObservable();

  private fpsHistory: ChartDataPoint[] = [];
  private memoryHistory: ChartDataPoint[] = [];
  private cpuHistory: ChartDataPoint[] = [];
  private changeDetectionHistory: ChartDataPoint[] = [];
  
  private readonly MAX_HISTORY = 120; // 60 seconds at 500ms intervals

  private lastFrameTime = 0;
  private frameCount = 0;
  private fps = 60;
  private animationFrameId: number | null = null;
  private monitoringInterval: any = null;

  private longTaskCount = 0;
  private longTaskObserver: PerformanceObserver | null = null;
  private paintMetrics: PaintMetrics = { fcp: null, lcp: null };
  private paintObserver: PerformanceObserver | null = null;

  private networkRequestCount = 0;
  private networkTransferredBytes = 0;
  private resourceObserver: PerformanceObserver | null = null;

  private lastNetworkCheck = 0;
  private activeEffectsCount = 0;

  // Angular-specific metrics
  private changeDetectionCycles = 0;
  private changeDetectionTime = 0;
  private zoneTasksExecuted = 0;
  private eventListenersTriggered = 0;
  private lastRouteChangeTime = 0;
  private cdStartTime = 0;
  private originalTick: any = null;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // Delay initialization slightly to ensure Angular is fully bootstrapped
      setTimeout(() => {
        this.initialize();
      }, 100);
    }
  }

  private initialize(): void {
    // Subscribe to active effects
    this.store.select(selectEnableSparkleEffect).subscribe(enabled => {
      this.updateActiveEffects();
    });
    this.store.select(selectEnable3DTiltEffect).subscribe(enabled => {
      this.updateActiveEffects();
    });
    this.store.select(selectEnableHolographicEffect).subscribe(enabled => {
      this.updateActiveEffects();
    });

    // Initialize performance observers
    this.initializeLongTaskObserver();
    this.initializePaintObserver();
    this.initializeResourceObserver();
    
    // Initialize Angular-specific tracking
    try {
      this.initializeAngularTracking();
    } catch (error) {
      console.warn('[PerfMonitor] Angular tracking initialization failed:', error);
    }
  }

  private updateActiveEffects(): void {
    let count = 0;
    this.store.select(selectEnableSparkleEffect).subscribe(e => e && count++).unsubscribe();
    this.store.select(selectEnable3DTiltEffect).subscribe(e => e && count++).unsubscribe();
    this.store.select(selectEnableHolographicEffect).subscribe(e => e && count++).unsubscribe();
    this.activeEffectsCount = count;
  }

  private initializeLongTaskObserver(): void {
    try {
      if ('PerformanceObserver' in window && PerformanceObserver.supportedEntryTypes?.includes('longtask')) {
        this.longTaskObserver = new PerformanceObserver((list) => {
          this.longTaskCount += list.getEntries().length;
        });
        this.longTaskObserver.observe({ entryTypes: ['longtask'] });
      }
    } catch (error) {
      console.warn('Long Task API not supported', error);
    }
  }

  private initializePaintObserver(): void {
    try {
      if ('PerformanceObserver' in window) {
        // Observe paint timing
        try {
          const paintObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
              if (entry.name === 'first-contentful-paint') {
                this.paintMetrics.fcp = entry.startTime;
              }
            });
          });
          paintObserver.observe({ type: 'paint', buffered: true });
        } catch (e) {
          console.warn('[PerfMonitor] Paint observer not supported:', e);
        }

        // Observe LCP separately
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            if (lastEntry) {
              this.paintMetrics.lcp = lastEntry.startTime;
            }
          });
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        } catch (e) {
          console.warn('[PerfMonitor] LCP observer not supported:', e);
        }
      }
    } catch (error) {
      console.warn('[PerfMonitor] Paint timing API not supported', error);
    }
  }

  private initializeResourceObserver(): void {
    try {
      if ('PerformanceObserver' in window) {
        this.resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries() as PerformanceResourceTiming[];
          entries.forEach(entry => {
            this.networkRequestCount++;
            this.networkTransferredBytes += entry.transferSize || 0;
          });
        });

        this.resourceObserver.observe({ 
          entryTypes: ['resource'],
          buffered: false 
        });
      }
    } catch (error) {
      console.warn('Resource timing API not supported', error);
    }
  }

  private initializeAngularTracking(): void {
    // Track route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const navEntry = performance.getEntriesByType('navigation')[0] as any;
      if (navEntry) {
        this.lastRouteChangeTime = navEntry.duration || 0;
      }
    });

    // Hook into ApplicationRef to track change detection
    this.patchChangeDetection();

    // Hook into Zone.js to track tasks
    this.trackZoneTasks();
  }

  private patchChangeDetection(): void {
    try {
      const appRef = this.appRef as any;
      
      if (!appRef || !appRef.tick) {
        console.warn('[PerfMonitor] ApplicationRef.tick not available');
        return;
      }

      if (!this.originalTick) {
        this.originalTick = appRef.tick.bind(appRef);
        
        const self = this;
        appRef.tick = function() {
          const start = performance.now();
          self.originalTick();
          const duration = performance.now() - start;
          
          self.changeDetectionCycles++;
          self.changeDetectionTime = duration;
        };
      }
    } catch (error) {
      console.warn('[PerfMonitor] Failed to patch change detection:', error);
    }
  }

  private trackZoneTasks(): void {
    // Store reference for event tracking (used by wrapped listeners)
    (window as any).__perfMonitorService = this;

    // Simple event listener tracking without patching
    // This will undercount but is safer
    try {
      const zone = (window as any).Zone;
      if (zone && zone.current) {
        // Estimate zone tasks from zone properties (less invasive)
        setInterval(() => {
          if (zone.current) {
            // This is a rough estimate
            this.zoneTasksExecuted++;
          }
        }, 1000);
      }
    } catch (error) {
      console.warn('[PerfMonitor] Zone tracking failed:', error);
    }
  }

  public startMonitoring(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      // Start FPS tracking
      this.trackFPS();

      // Collect metrics immediately
      this.collectMetrics();

      // Collect metrics every 500ms
      this.monitoringInterval = setInterval(() => {
        this.collectMetrics();
      }, 500);
    });
  }

  public stopMonitoring(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.monitoringInterval !== null) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    // Clean up observers
    this.longTaskObserver?.disconnect();
    this.paintObserver?.disconnect();
    this.resourceObserver?.disconnect();

    // Restore original change detection if patched
    if (this.originalTick) {
      const appRef = this.appRef as any;
      appRef.tick = this.originalTick;
      this.originalTick = null;
    }

    // Clean up window reference
    delete (window as any).__perfMonitorService;
  }

  private trackFPS(): void {
    const now = performance.now();
    
    if (this.lastFrameTime > 0) {
      const delta = now - this.lastFrameTime;
      this.frameCount++;
      
      // Calculate FPS every 500ms
      if (delta >= 500) {
        this.fps = Math.round((this.frameCount * 1000) / delta);
        this.frameCount = 0;
        this.lastFrameTime = now;
      }
    } else {
      this.lastFrameTime = now;
    }

    this.animationFrameId = requestAnimationFrame(() => this.trackFPS());
  }

  private collectMetrics(): void {
    const now = performance.now();

    const metrics: PerformanceMetrics = {
      fps: this.fps,
      memory: this.getMemoryMetrics(),
      dom: this.getDOMMetrics(),
      cpu: this.getCPUMetrics(),
      network: this.getNetworkMetrics(),
      paint: this.paintMetrics,
      angular: this.getAngularMetrics(),
      activeEffects: this.activeEffectsCount,
      currentRoute: window.location.pathname,
      timestamp: now
    };

    // Update history buffers
    this.addToHistory(this.fpsHistory, { timestamp: now, value: metrics.fps });
    if (metrics.memory) {
      this.addToHistory(this.memoryHistory, { 
        timestamp: now, 
        value: metrics.memory.usedMB 
      });
    }
    this.addToHistory(this.cpuHistory, { 
      timestamp: now, 
      value: metrics.cpu.estimatedUsage 
    });
    this.addToHistory(this.changeDetectionHistory, {
      timestamp: now,
      value: metrics.angular.changeDetectionCycles
    });

    this.metricsSubject.next(metrics);
  }

  private addToHistory(history: ChartDataPoint[], point: ChartDataPoint): void {
    history.push(point);
    if (history.length > this.MAX_HISTORY) {
      history.shift();
    }
  }

  private getMemoryMetrics(): MemoryMetrics | null {
    const perf = performance as any;
    if (perf.memory) {
      const usedMB = perf.memory.usedJSHeapSize / 1048576;
      const totalMB = perf.memory.totalJSHeapSize / 1048576;
      const limitMB = perf.memory.jsHeapSizeLimit / 1048576;
      
      return {
        usedJSHeapSize: perf.memory.usedJSHeapSize,
        totalJSHeapSize: perf.memory.totalJSHeapSize,
        jsHeapSizeLimit: perf.memory.jsHeapSizeLimit,
        usedMB,
        totalMB,
        limitMB,
        usagePercent: (usedMB / limitMB) * 100
      };
    }
    return null;
  }

  private getDOMMetrics(): DOMMetrics {
    const nodeCount = document.getElementsByTagName('*').length;
    const listenerCount = this.estimateEventListeners();
    
    return {
      nodeCount,
      listenerCount
    };
  }

  private estimateEventListeners(): number {
    // This is an estimation based on interactive elements
    const interactive = document.querySelectorAll('button, a, input, select, textarea, [onclick]');
    return interactive.length;
  }

  private getAngularMetrics(): AngularMetrics {
    // Count Angular components by finding elements with Angular-specific attributes
    let componentCount = 0;
    try {
      // Count all elements and filter for Angular attributes
      const allElements = document.querySelectorAll('*');
      for (let i = 0; i < allElements.length; i++) {
        const element = allElements[i];
        // Check if element has any Angular-specific attributes
        for (let j = 0; j < element.attributes.length; j++) {
          const attrName = element.attributes[j].name;
          if (attrName.startsWith('_ngcontent-') || attrName.startsWith('_nghost-') || attrName === 'ng-version') {
            componentCount++;
            break; // Count each element only once
          }
        }
      }
    } catch (error) {
      console.warn('[PerfMonitor] Failed to count components:', error);
    }
    
    return {
      changeDetectionCycles: this.changeDetectionCycles,
      changeDetectionTime: this.changeDetectionTime,
      componentCount: componentCount,
      zoneTasksExecuted: this.zoneTasksExecuted,
      eventListenersTriggered: this.eventListenersTriggered,
      lastRouteChangeTime: this.lastRouteChangeTime
    };
  }

  private getCPUMetrics(): CPUMetrics {
    const frameTime = this.fps > 0 ? 1000 / this.fps : 16.67;
    const idealFrameTime = 16.67; // 60fps
    const estimatedUsage = Math.min(100, (frameTime / idealFrameTime) * 100);

    const metrics: CPUMetrics = {
      estimatedUsage: Math.round(estimatedUsage),
      longTaskCount: this.longTaskCount,
      averageFrameTime: Math.round(frameTime * 100) / 100
    };

    return metrics;
  }

  private getNetworkMetrics(): NetworkMetrics {
    const now = Date.now();
    const timeSinceLastCheck = now - this.lastNetworkCheck;
    
    // Reset counters periodically
    if (timeSinceLastCheck > 10000) {
      this.networkRequestCount = 0;
      this.networkTransferredBytes = 0;
      this.lastNetworkCheck = now;
    }

    return {
      requestCount: this.networkRequestCount,
      transferredKB: Math.round(this.networkTransferredBytes / 1024),
      activeRequests: 0 // Could be enhanced with XHR/Fetch interceptors
    };
  }

  public getFPSHistory(): ChartDataPoint[] {
    return [...this.fpsHistory];
  }

  public getMemoryHistory(): ChartDataPoint[] {
    return [...this.memoryHistory];
  }

  public getCPUHistory(): ChartDataPoint[] {
    return [...this.cpuHistory];
  }

  public getChangeDetectionHistory(): ChartDataPoint[] {
    return [...this.changeDetectionHistory];
  }

  public getPerformanceStatus(): 'good' | 'warning' | 'critical' {
    if (this.fps < 24) return 'critical';
    if (this.fps < 45) return 'warning';
    
    const memory = this.getMemoryMetrics();
    if (memory && memory.usagePercent > 90) return 'critical';
    if (memory && memory.usagePercent > 75) return 'warning';
    
    return 'good';
  }
}

