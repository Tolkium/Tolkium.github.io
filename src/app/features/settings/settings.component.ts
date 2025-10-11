import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { shareReplay } from 'rxjs/operators';
import { selectHideScrollbar, selectEnableSparkleEffect, selectEnable3DTiltEffect, selectEnableHolographicEffect, selectShowPerformanceMonitor, selectPerformanceMonitorThemeColor } from '../../core/store/ui.selectors';
import { toggleHideScrollbar, toggleSparkleEffect, toggle3DTiltEffect, toggleHolographicEffect, togglePerformanceMonitor, setPerformanceMonitorThemeColor } from '../../core/store/ui.actions';
import { BackgroundAnimationComponent } from '../../shared/components/background-animation/background-animation.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, BackgroundAnimationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <div class="relative">
    <div class="fixed inset-0 z-0">
      <app-background-animation></app-background-animation>
    </div>

    <div class="relative z-10">
      <div class="container mx-auto px-2 py-2 md:py-0 md:px-0 max-w-4xl">
        <div class="bg-white/50 dark:bg-slate-800/50 p-6 rounded-lg shadow-md backdrop-blur-sm">
          <h1 class="text-2xl font-bold text-[#f29f67]/90 dark:text-[#8833cc]/70 mb-6 font-outfit">Settings</h1>

          <!-- UI Settings -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-3 font-outfit">UI Settings</h2>
            <div class="flex items-center justify-between bg-white/60 dark:bg-slate-800/60 rounded-lg p-4 shadow-sm">
              <div>
                <div class="font-medium text-slate-700 dark:text-slate-300 font-inter">Hide page scrollbar</div>
                <div class="text-sm text-slate-600 dark:text-slate-400 font-inter">Default: hidden. Persists in your browser.</div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  class="sr-only peer" 
                  [checked]="(hideScrollbar$ | async) ?? true" 
                  (change)="onToggleScrollbar($event)" 
                />
                <div class="relative w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-600 peer-checked:bg-[#8833cc] transition-colors">
                  <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform" [class.translate-x-5]="(hideScrollbar$ | async) ?? true"></div>
                </div>
              </label>
            </div>
          </div>

          <!-- Performance Settings -->
          <div>
            <h2 class="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-3 font-outfit">Performance Settings</h2>
            <div class="space-y-3">
              <!-- 3D Tilt Effect -->
              <div class="relative group">
                <div class="flex items-center justify-between bg-white/60 dark:bg-slate-800/60 rounded-lg p-4 shadow-sm">
                  <div class="flex-1 pr-4">
                    <div class="font-medium text-slate-700 dark:text-slate-300 font-inter">Card 3D tilt effect</div>
                    <div class="text-sm text-slate-600 dark:text-slate-400 font-inter">3D rotation effect that follows your cursor position.</div>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="sr-only peer" 
                      [checked]="(enable3DTiltEffect$ | async) ?? true" 
                      (change)="onToggle3DTilt($event)" 
                    />
                    <div class="relative w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-600 peer-checked:bg-[#8833cc] transition-colors">
                      <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform" [class.translate-x-5]="(enable3DTiltEffect$ | async) ?? true"></div>
                    </div>
                  </label>
                </div>
                
                <div class="absolute left-0 right-0 -bottom-2 translate-y-full opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
                  <div class="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm p-3 rounded-lg shadow-lg mt-2 border border-slate-300 dark:border-slate-600">
                    <p class="font-semibold mb-1">Why disable this?</p>
                    <p class="text-slate-700 dark:text-slate-300">The 3D tilt uses real-time cursor tracking and CSS transforms. Disabling it reduces CPU usage, especially beneficial on devices with weaker GPUs or when displaying many cards simultaneously.</p>
                  </div>
                </div>
              </div>

              <!-- Holographic Effect -->
              <div class="relative group">
                <div class="flex items-center justify-between bg-white/60 dark:bg-slate-800/60 rounded-lg p-4 shadow-sm">
                  <div class="flex-1 pr-4">
                    <div class="font-medium text-slate-700 dark:text-slate-300 font-inter">Card holographic gradient</div>
                    <div class="text-sm text-slate-600 dark:text-slate-400 font-inter">Rainbow gradient that shifts based on cursor position.</div>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="sr-only peer" 
                      [checked]="(enableHolographicEffect$ | async) ?? true" 
                      (change)="onToggleHolographic($event)" 
                    />
                    <div class="relative w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-600 peer-checked:bg-[#8833cc] transition-colors">
                      <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform" [class.translate-x-5]="(enableHolographicEffect$ | async) ?? true"></div>
                    </div>
                  </label>
                </div>
                
                <div class="absolute left-0 right-0 -bottom-2 translate-y-full opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
                  <div class="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm p-3 rounded-lg shadow-lg mt-2 border border-slate-300 dark:border-slate-600">
                    <p class="font-semibold mb-1">Why disable this?</p>
                    <p class="text-slate-700 dark:text-slate-300">The holographic gradient uses blend modes and filters for color shifting. While less intensive than other effects, disabling it can improve performance on older devices or when battery life is a concern.</p>
                  </div>
                </div>
              </div>

              <!-- Sparkle Effect -->
              <div class="relative group">
                <div class="flex items-center justify-between bg-white/60 dark:bg-slate-800/60 rounded-lg p-4 shadow-sm">
                  <div class="flex-1 pr-4">
                    <div class="font-medium text-slate-700 dark:text-slate-300 font-inter">Card sparkle effect</div>
                    <div class="text-sm text-slate-600 dark:text-slate-400 font-inter">Animated sparkle effect that follows your cursor on project cards.</div>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="sr-only peer" 
                      [checked]="(enableSparkleEffect$ | async) ?? true" 
                      (change)="onToggleSparkle($event)" 
                    />
                    <div class="relative w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-600 peer-checked:bg-[#8833cc] transition-colors">
                      <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform" [class.translate-x-5]="(enableSparkleEffect$ | async) ?? true"></div>
                    </div>
                  </label>
                </div>
                
                <div class="absolute left-0 right-0 -bottom-2 translate-y-full opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
                  <div class="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm p-3 rounded-lg shadow-lg mt-2 border border-slate-300 dark:border-slate-600">
                    <p class="font-semibold mb-1">Why disable this?</p>
                    <p class="text-slate-700 dark:text-slate-300">The sparkle effect uses real-time cursor tracking and CSS masking, which is the most performance-intensive effect. Disabling it provides the biggest performance improvement on low-end devices or when many cards are visible.</p>
                  </div>
                </div>
              </div>

              <!-- Performance Monitor -->
              <div class="relative group">
                <div class="flex items-center justify-between bg-white/60 dark:bg-slate-800/60 rounded-lg p-4 shadow-sm">
                  <div class="flex-1 pr-4">
                    <div class="font-medium text-slate-700 dark:text-slate-300 font-inter">Performance Monitor</div>
                    <div class="text-sm text-slate-600 dark:text-slate-400 font-inter">Display real-time performance metrics overlay (Ctrl+Shift+P).</div>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="sr-only peer" 
                      [checked]="(showPerformanceMonitor$ | async) ?? false" 
                      (change)="onTogglePerformanceMonitor($event)" 
                    />
                    <div class="relative w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-600 peer-checked:bg-[#8833cc] transition-colors">
                      <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform" [class.translate-x-5]="(showPerformanceMonitor$ | async) ?? false"></div>
                    </div>
                  </label>
                </div>
                
                <div class="absolute left-0 right-0 -bottom-2 translate-y-full opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
                  <div class="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm p-3 rounded-lg shadow-lg mt-2 border border-slate-300 dark:border-slate-600">
                    <p class="font-semibold mb-1">What does this do?</p>
                    <p class="text-slate-700 dark:text-slate-300">Shows a draggable overlay with real-time FPS, memory usage, CPU estimates, DOM stats, and network activity. Use it to diagnose performance issues across different pages. The monitor itself has minimal performance impact.</p>
                  </div>
                </div>
              </div>

              <!-- Performance Monitor Theme Color -->
              <div class="bg-white/60 dark:bg-slate-800/60 rounded-lg p-4 shadow-sm">
                <div class="mb-3">
                  <div class="font-medium text-slate-700 dark:text-slate-300 font-inter mb-1">Performance Monitor Theme Color</div>
                  <div class="text-sm text-slate-600 dark:text-slate-400 font-inter">Customize the overlay UI color. All elements adapt to your selection.</div>
                </div>
                
                <!-- Color Picker -->
                <div class="flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3">
                    <label class="relative cursor-pointer group">
                      <input 
                        type="color" 
                        [value]="(performanceMonitorThemeColor$ | async) ?? '#c77dff'"
                        (input)="onChangeThemeColor($any($event.target).value)"
                        class="sr-only"
                      />
                      <div 
                        class="w-16 h-16 rounded-lg border-2 border-white dark:border-slate-600 shadow-lg transition-transform group-hover:scale-105 cursor-pointer"
                        [style.background-color]="(performanceMonitorThemeColor$ | async) ?? '#c77dff'"
                        [style.box-shadow]="'0 0 20px ' + ((performanceMonitorThemeColor$ | async) ?? '#c77dff') + '80'"
                      ></div>
                      <div class="absolute -bottom-1 -right-1 bg-slate-700 text-white text-xs px-2 py-0.5 rounded shadow">
                        Pick
                      </div>
                    </label>
                    <div class="flex flex-col gap-1">
                      <span class="text-sm font-medium text-slate-700 dark:text-slate-300 font-inter">Overlay Theme Color</span>
                      <span class="text-xs text-slate-500 dark:text-slate-400 font-mono">{{ (performanceMonitorThemeColor$ | async) ?? '#c77dff' }}</span>
                      <span class="text-xs text-slate-600 dark:text-slate-400 font-inter">Click the square to select any color</span>
                    </div>
                  </div>
                  
                  <!-- Reset Button -->
                  <button
                    (click)="onResetThemeColor()"
                    class="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors shadow-sm font-inter"
                  >
                    Reset to Default
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
  `]
})
export class SettingsComponent {
  private readonly store = inject(Store);
  
  readonly hideScrollbar$ = this.store.select(selectHideScrollbar).pipe(shareReplay(1));
  readonly enableSparkleEffect$ = this.store.select(selectEnableSparkleEffect).pipe(shareReplay(1));
  readonly enable3DTiltEffect$ = this.store.select(selectEnable3DTiltEffect).pipe(shareReplay(1));
  readonly enableHolographicEffect$ = this.store.select(selectEnableHolographicEffect).pipe(shareReplay(1));
  readonly showPerformanceMonitor$ = this.store.select(selectShowPerformanceMonitor).pipe(shareReplay(1));
  readonly performanceMonitorThemeColor$ = this.store.select(selectPerformanceMonitorThemeColor).pipe(shareReplay(1));

  public onToggleScrollbar(_event: Event): void {
    this.store.dispatch(toggleHideScrollbar());
  }

  public onToggleSparkle(_event: Event): void {
    this.store.dispatch(toggleSparkleEffect());
  }

  public onToggle3DTilt(_event: Event): void {
    this.store.dispatch(toggle3DTiltEffect());
  }

  public onToggleHolographic(_event: Event): void {
    this.store.dispatch(toggleHolographicEffect());
  }

  public onTogglePerformanceMonitor(_event: Event): void {
    this.store.dispatch(togglePerformanceMonitor());
  }

  public onChangeThemeColor(color: string): void {
    this.store.dispatch(setPerformanceMonitorThemeColor({ themeColor: color }));
  }

  public onResetThemeColor(): void {
    this.store.dispatch(setPerformanceMonitorThemeColor({ themeColor: '#c77dff' }));
  }
}
