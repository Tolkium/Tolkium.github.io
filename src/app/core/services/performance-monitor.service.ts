import { Injectable, NgZone, inject, PLATFORM_ID, ApplicationRef, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd, NavigationStart, NavigationCancel, NavigationError } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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
export class PerformanceMonitorService implements OnDestroy {
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
  private lcpObserver: PerformanceObserver | null = null;
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
  private routeNavigationStartTime: number | null = null;
  private cdStartTime = 0;
  private originalTick: any = null;

  // CPU utilization tracking
  private cpuUtilization = 0;
  private lastCpuMeasurement = 0;
  private idleTimeStart = 0;
  private busyTime = 0;
  private totalTime = 0;
  private cpuMeasurementInterval: any = null;
  private zoneTaskInterval: any = null;
  private cpuIdleCallbackId: number | null = null;
  private isCPUTrackingActive = false;
  private isMonitoring = false;
  private readonly destroy$ = new Subject<void>();
  private readonly subscriptions = new Subscription();
  private sparkleEnabled = false;
  private tiltEnabled = false;
  private holographicEnabled = false;
  private readonly trackedEventTypes = [
    'click',
    'dblclick',
    'keydown',
    'keyup',
    'input',
    'change',
    'submit',
    'pointerdown',
    'pointerup',
    'touchstart',
    'touchend',
    'wheel',
    'scroll'
  ] as const;
  private readonly globalEventHandler = () => {
    this.eventListenersTriggered++;
  };
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
    this.subscriptions.add(
      this.store.select(selectEnableSparkleEffect).pipe(takeUntil(this.destroy$)).subscribe(enabled => {
        this.sparkleEnabled = enabled;
        this.updateActiveEffects();
      })
    );
    this.subscriptions.add(
      this.store.select(selectEnable3DTiltEffect).pipe(takeUntil(this.destroy$)).subscribe(enabled => {
        this.tiltEnabled = enabled;
        this.updateActiveEffects();
      })
    );
    this.subscriptions.add(
      this.store.select(selectEnableHolographicEffect).pipe(takeUntil(this.destroy$)).subscribe(enabled => {
        this.holographicEnabled = enabled;
        this.updateActiveEffects();
      })
    );

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
    this.activeEffectsCount =
      Number(this.sparkleEnabled) + Number(this.tiltEnabled) + Number(this.holographicEnabled);
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
          this.paintObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
              if (entry.name === 'first-contentful-paint') {
                this.paintMetrics.fcp = entry.startTime;
              }
            });
          });
          this.paintObserver.observe({ type: 'paint', buffered: true });
        } catch (e) {
          console.warn('[PerfMonitor] Paint observer not supported:', e);
        }

        // Observe LCP separately
        try {
          this.lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            if (lastEntry) {
              this.paintMetrics.lcp = lastEntry.startTime;
            }
          });
          this.lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
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
    this.subscriptions.add(
      this.router.events.pipe(takeUntil(this.destroy$)).subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.routeNavigationStartTime = performance.now();
          this.lastRouteChangeTime = 0;
          return;
        }

        if (event instanceof NavigationEnd) {
          if (this.routeNavigationStartTime !== null) {
            this.lastRouteChangeTime = performance.now() - this.routeNavigationStartTime;
            this.routeNavigationStartTime = null;
          }
          return;
        }

        if (event instanceof NavigationCancel || event instanceof NavigationError) {
          this.routeNavigationStartTime = null;
        }
      })
    );

    // Hook into ApplicationRef to track change detection
    this.patchChangeDetection();

    // Hook into Zone.js to track tasks
    this.trackZoneTasks();

    // Count user-driven DOM events in capture phase.
    this.setupEventTracking();
  }

  private patchChangeDetection(): void {
    try {
      // Track change detection through Zone.js hooks
      const zone = (window as any).Zone;
      if (zone && zone.current) {
        const self = this;
        const originalOnScheduleTask = zone.current.onScheduleTask;
        
        // Hook into zone task scheduling to detect change detection triggers
        zone.current.onScheduleTask = function(delegate: any, current: any, target: any, task: any) {
          if (task && task.type === 'microTask' && task.source === 'Promise.then') {
            // Promise-based tasks often trigger change detection
            self.incrementChangeDetection();
          }
          return originalOnScheduleTask ? originalOnScheduleTask.call(this, delegate, current, target, task) : delegate.scheduleTask(target, task);
        };
      }

      // Also track via ApplicationRef for manual ticks
      const appRef = this.appRef as any;
      if (appRef && appRef.tick && !this.originalTick) {
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

      // Track change detection through NgZone
      // onUnstable = change detection starts
      // onStable = change detection completes
      if (this.ngZone) {
        // Capture start time when change detection begins
        this.subscriptions.add(
          this.ngZone.onUnstable.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.cdStartTime = performance.now();
          })
        );
        
        // Capture end time and calculate duration when change detection completes
        this.subscriptions.add(
          this.ngZone.onStable.pipe(takeUntil(this.destroy$)).subscribe(() => {
            // On stable is called after change detection completes
            // This is the most reliable way to track all change detection
            const cdEnd = performance.now();
            this.changeDetectionCycles++;
            
            // Measure actual change detection duration
            if (this.cdStartTime > 0) {
              this.changeDetectionTime = cdEnd - this.cdStartTime;
              // Cap at reasonable maximum (100ms) to avoid outliers
              if (this.changeDetectionTime > 100) {
                this.changeDetectionTime = 100;
              }
            } else {
              // Fallback if start time wasn't captured
              this.changeDetectionTime = 0;
            }
            this.cdStartTime = 0; // Reset for next cycle
          })
        );
      }
    } catch (error) {
      console.warn('[PerfMonitor] Failed to patch change detection:', error);
    }
  }

  private incrementChangeDetection(): void {
    // This is called from zone hooks for additional tracking
    // But primary tracking is through onStable
    this.changeDetectionCycles++;
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
        this.zoneTaskInterval = setInterval(() => {
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

  private setupEventTracking(): void {
    for (const eventType of this.trackedEventTypes) {
      window.addEventListener(eventType, this.globalEventHandler, { capture: true, passive: true });
    }
  }

  private cleanupEventTracking(): void {
    for (const eventType of this.trackedEventTypes) {
      window.removeEventListener(eventType, this.globalEventHandler, true);
    }
  }

  public startMonitoring(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (this.isMonitoring) {
      return;
    }
    this.isMonitoring = true;

    this.ngZone.runOutsideAngular(() => {
      // Start FPS tracking
      this.trackFPS();

      // Start CPU utilization tracking
      this.startCPUTracking();

      // Collect metrics immediately
      this.collectMetrics();

      // Collect metrics every 500ms
      this.monitoringInterval = setInterval(() => {
        this.collectMetrics();
      }, 500);
    });
  }

  public stopMonitoring(): void {
    this.isMonitoring = false;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.monitoringInterval !== null) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (this.cpuMeasurementInterval !== null) {
      clearInterval(this.cpuMeasurementInterval);
      this.cpuMeasurementInterval = null;
    }

    this.isCPUTrackingActive = false;
    if (this.cpuIdleCallbackId !== null && 'cancelIdleCallback' in window) {
      (window as any).cancelIdleCallback(this.cpuIdleCallbackId);
      this.cpuIdleCallbackId = null;
    }

    if (this.zoneTaskInterval !== null) {
      clearInterval(this.zoneTaskInterval);
      this.zoneTaskInterval = null;
    }
    this.cleanupEventTracking();

    // Clean up observers
    this.longTaskObserver?.disconnect();
    this.paintObserver?.disconnect();
    this.lcpObserver?.disconnect();
    this.resourceObserver?.disconnect();
    this.longTaskObserver = null;
    this.paintObserver = null;
    this.lcpObserver = null;
    this.resourceObserver = null;

    // Restore original change detection if patched
    if (this.originalTick) {
      const appRef = this.appRef as any;
      appRef.tick = this.originalTick;
      this.originalTick = null;
    }

    // Clean up window reference
    delete (window as any).__perfMonitorService;
  }

  public ngOnDestroy(): void {
    this.stopMonitoring();
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.unsubscribe();
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

  /**
   * Tracks CPU utilization by measuring busy vs idle time
   * Uses performance timing and long task detection
   */
  private startCPUTracking(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.isCPUTrackingActive = true;

    const measurementWindow = 1000; // Measure over 1 second
    let lastMeasurement = performance.now();
    let busyTimeAccumulator = 0;
    let measurementStart = performance.now();

    // Track time spent in JavaScript execution
    const markBusyStart = () => {
      this.busyTime = performance.now();
    };

    const markBusyEnd = () => {
      if (this.busyTime > 0) {
        const busy = performance.now() - this.busyTime;
        busyTimeAccumulator += busy;
      }
    };

    // Use requestIdleCallback to detect idle time (when browser is not busy)
    const scheduleIdleMeasurement = () => {
      if (this.isCPUTrackingActive && 'requestIdleCallback' in window) {
        this.cpuIdleCallbackId = (window as any).requestIdleCallback((deadline: IdleDeadline) => {
          if (!this.isCPUTrackingActive) {
            return;
          }

          // Time remaining means we were idle
          const idleTime = deadline.timeRemaining();
          const totalElapsed = performance.now() - measurementStart;
          
          if (totalElapsed >= measurementWindow) {
            // Calculate CPU usage: busy time / total time
            const totalBusy = busyTimeAccumulator;
            this.cpuUtilization = Math.min(100, Math.max(0, (totalBusy / totalElapsed) * 100));
            
            // Reset for next measurement window
            busyTimeAccumulator = 0;
            measurementStart = performance.now();
          }
          
          scheduleIdleMeasurement();
        }, { timeout: 100 });
      }
    };

    // Measure using interval-based approach (more reliable)
    this.cpuMeasurementInterval = setInterval(() => {
      const now = performance.now();
      const elapsed = now - lastMeasurement;
      
      // Calculate CPU utilization based on multiple factors
      let totalBusyTime = 0;
      
      // 1. Long tasks indicate heavy CPU usage
      // Each long task blocks the main thread for 50ms+
      if (this.longTaskCount > 0) {
        totalBusyTime += this.longTaskCount * 50;
        this.longTaskCount = 0; // Reset after using
      }
      
      // 2. Slow change detection indicates CPU bottlenecks
      if (this.changeDetectionTime > 16) {
        // Factor in the overhead (each CD cycle takes time)
        totalBusyTime += this.changeDetectionTime * 2; // Multiply by 2 for overhead
      }
      
      // 3. Frame rate drops indicate CPU saturation
      if (this.fps < 60 && this.fps > 0) {
        // Calculate how much time per frame we're spending
        const actualFrameTime = 1000 / this.fps;
        const idealFrameTime = 16.67; // 60fps
        const extraTimePerFrame = actualFrameTime - idealFrameTime;
        // Estimate busy time: extra time per frame * frames in measurement window
        const framesInWindow = elapsed / actualFrameTime;
        totalBusyTime += extraTimePerFrame * framesInWindow;
      }
      
      // Calculate CPU utilization percentage
      // Formula: (busy time / elapsed time) * 100
      // This gives us a percentage of time the CPU was busy
      const usagePercent = (totalBusyTime / elapsed) * 100;
      
      // Apply smoothing to avoid wild fluctuations
      // Weighted average: 70% previous value, 30% new value
      this.cpuUtilization = this.cpuUtilization * 0.7 + usagePercent * 0.3;
      
      // Clamp to valid range
      this.cpuUtilization = Math.min(100, Math.max(0, this.cpuUtilization));
      
      // Reset for next measurement
      lastMeasurement = now;
    }, measurementWindow);

    // Start idle callback tracking if available
    scheduleIdleMeasurement();
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
    // Record change detection cycles that occurred in this interval
    // Then reset counter for next interval to track rate per 500ms
    const cdCount = metrics.angular.changeDetectionCycles;
    this.addToHistory(this.changeDetectionHistory, {
      timestamp: now,
      value: cdCount
    });
    
    // Reset counter for next collection interval to track rate
    // This way the chart shows CD cycles per 500ms interval
    this.changeDetectionCycles = 0;
    // Keep this metric as events fired in the last 500ms window.
    this.eventListenersTriggered = 0;

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
    // Approximate component instances by counting Angular component host elements.
    // _ngcontent-* appears on many child nodes and overcounts heavily.
    let componentCount = 0;
    try {
      // Count all elements and look for _nghost-* attributes only.
      const allElements = document.querySelectorAll('*');
      for (let i = 0; i < allElements.length; i++) {
        const element = allElements[i];
        // _nghost-* marks component host nodes in Angular's emulated encapsulation.
        for (let j = 0; j < element.attributes.length; j++) {
          const attrName = element.attributes[j].name;
          if (attrName.startsWith('_nghost-')) {
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
    
    // Use the tracked CPU utilization if available, otherwise fall back to estimation
    let estimatedUsage = this.cpuUtilization;
    
    // If we don't have CPU tracking data yet (first few seconds), use FPS-based fallback
    if (estimatedUsage === 0 || isNaN(estimatedUsage)) {
      // Fallback estimation based on performance indicators
      const idealFPS = 60;
      if (this.fps >= idealFPS) {
        estimatedUsage = 10 + Math.random() * 10; // 10-20% when running smoothly
      } else if (this.fps >= 45) {
        estimatedUsage = 20 + ((idealFPS - this.fps) / (idealFPS - 45)) * 20; // 20-40%
      } else if (this.fps >= 30) {
        estimatedUsage = 40 + ((45 - this.fps) / 15) * 20; // 40-60%
      } else {
        estimatedUsage = 60 + ((30 - this.fps) / 30) * 40; // 60-100%
      }
    }

    // Ensure value is in valid range
    estimatedUsage = Math.min(100, Math.max(0, estimatedUsage));

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

