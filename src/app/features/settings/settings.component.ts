import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { shareReplay } from 'rxjs/operators';
import { 
  selectHideScrollbar, 
  selectEnableSparkleEffect, 
  selectEnable3DTiltEffect, 
  selectEnableHolographicEffect, 
  selectShowPerformanceMonitor, 
  selectPerformanceMonitorThemeColor, 
  selectEnableBackgroundAnimation,
  selectEnableMagneticForce,
  selectEnableRepulsionForce,
  selectEnableDamping,
  selectEnableBrownianMotion,
  selectEnableClusterBreaking,
  selectNumPoints,
  selectConnectionRadius,
  selectMagneticRadius,
  selectMagneticStrength,
  selectMinSpeed,
  selectMaxSpeed,
  selectPointsSize,
  selectLineWidth,
  selectRepulsionRadius,
  selectRepulsionStrength,
  selectDampingFactor,
  selectBrownianStrength,
  selectClusterThreshold,
  selectExplosionForce,
  selectClusterCheckInterval,
  selectMinClusterSize
} from '../../core/store/ui.selectors';
import { 
  toggleHideScrollbar, 
  toggleSparkleEffect, 
  toggle3DTiltEffect, 
  toggleHolographicEffect, 
  togglePerformanceMonitor, 
  setPerformanceMonitorThemeColor, 
  toggleBackgroundAnimation,
  toggleMagneticForce,
  toggleRepulsionForce,
  toggleDamping,
  toggleBrownianMotion,
  toggleClusterBreaking,
  setNumPoints,
  setConnectionRadius,
  setMagneticRadius,
  setMagneticStrengthValue,
  setMinSpeed,
  setMaxSpeed,
  setPointsSize,
  setLineWidth,
  setRepulsionRadiusValue,
  setRepulsionStrengthValue,
  setDampingFactorValue,
  setBrownianStrengthValue,
  setClusterThresholdValue,
  setExplosionForceValue,
  setClusterCheckIntervalValue,
  setMinClusterSizeValue,
  resetAnimationSettings
} from '../../core/store/ui.actions';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <div class="relative z-10">
    <div class="container mx-auto px-2 py-2 md:py-0 md:px-0 max-w-4xl">
        <div class="bg-white/50 dark:bg-slate-800/50 p-6 rounded-lg shadow-md backdrop-blur-sm">
          <h1 class="text-2xl font-bold text-[#f29f67]/90 dark:text-[#8833cc]/70 mb-6 font-outfit">Settings</h1>

          <!-- UI Settings -->
          <div class="mb-6">
            <h2 class="text-base font-semibold text-slate-700 dark:text-slate-300 mb-2 font-outfit">UI Settings</h2>
            <div class="flex items-center justify-between bg-white/60 dark:bg-slate-800/60 rounded-lg p-3 shadow-sm">
              <div>
                <div class="text-sm font-medium text-slate-700 dark:text-slate-300 font-inter">Hide page scrollbar</div>
                <div class="text-xs text-slate-600 dark:text-slate-400 font-inter">Persists in your browser</div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  class="sr-only peer" 
                  [checked]="(hideScrollbar$ | async) ?? true" 
                  (change)="onToggleScrollbar($event)" 
                />
                <div class="relative w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-600 toggle-bg transition-colors">
                  <div class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transform transition-transform" [class.translate-x-4]="(hideScrollbar$ | async) ?? true"></div>
                </div>
              </label>
            </div>
          </div>

          <!-- Performance Settings -->
          <div>
            <h2 class="text-base font-semibold text-slate-700 dark:text-slate-300 mb-2 font-outfit">Performance Settings</h2>
            <div class="space-y-2">
              <!-- 3D Tilt Effect -->
              <div class="relative group">
                <div class="flex items-center justify-between bg-white/60 dark:bg-slate-800/60 rounded-lg p-3 shadow-sm">
                  <div class="flex-1 pr-3">
                    <div class="text-sm font-medium text-slate-700 dark:text-slate-300 font-inter">Card 3D tilt effect</div>
                    <div class="text-xs text-slate-600 dark:text-slate-400 font-inter">3D rotation follows cursor</div>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="sr-only peer" 
                      [checked]="(enable3DTiltEffect$ | async) ?? true" 
                      (change)="onToggle3DTilt($event)" 
                    />
                    <div class="relative w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-600 toggle-bg transition-colors">
                      <div class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transform transition-transform" [class.translate-x-4]="(enable3DTiltEffect$ | async) ?? true"></div>
                    </div>
                  </label>
                </div>
                
                <div class="absolute left-0 right-0 -bottom-2 translate-y-full opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
                  <div class="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs p-2 rounded-lg shadow-lg mt-2 border border-slate-300 dark:border-slate-600">
                    <p class="font-semibold mb-1">Why disable?</p>
                    <p class="text-slate-700 dark:text-slate-300">Reduces CPU usage on weaker GPUs or when displaying many cards.</p>
                  </div>
                </div>
              </div>

              <!-- Holographic Effect -->
              <div class="relative group">
                <div class="flex items-center justify-between bg-white/60 dark:bg-slate-800/60 rounded-lg p-3 shadow-sm">
                  <div class="flex-1 pr-3">
                    <div class="text-sm font-medium text-slate-700 dark:text-slate-300 font-inter">Card holographic gradient</div>
                    <div class="text-xs text-slate-600 dark:text-slate-400 font-inter">Rainbow gradient shifts with cursor</div>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="sr-only peer" 
                      [checked]="(enableHolographicEffect$ | async) ?? true" 
                      (change)="onToggleHolographic($event)" 
                    />
                    <div class="relative w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-600 toggle-bg transition-colors">
                      <div class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transform transition-transform" [class.translate-x-4]="(enableHolographicEffect$ | async) ?? true"></div>
                    </div>
                  </label>
                </div>
                
                <div class="absolute left-0 right-0 -bottom-2 translate-y-full opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
                  <div class="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs p-2 rounded-lg shadow-lg mt-2 border border-slate-300 dark:border-slate-600">
                    <p class="font-semibold mb-1">Why disable?</p>
                    <p class="text-slate-700 dark:text-slate-300">Improves performance on older devices or when battery life is a concern.</p>
                  </div>
                </div>
              </div>

              <!-- Sparkle Effect -->
              <div class="relative group">
                <div class="flex items-center justify-between bg-white/60 dark:bg-slate-800/60 rounded-lg p-3 shadow-sm">
                  <div class="flex-1 pr-3">
                    <div class="text-sm font-medium text-slate-700 dark:text-slate-300 font-inter">Card sparkle effect</div>
                    <div class="text-xs text-slate-600 dark:text-slate-400 font-inter">Animated sparkles follow cursor</div>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="sr-only peer" 
                      [checked]="(enableSparkleEffect$ | async) ?? true" 
                      (change)="onToggleSparkle($event)" 
                    />
                    <div class="relative w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-600 toggle-bg transition-colors">
                      <div class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transform transition-transform" [class.translate-x-4]="(enableSparkleEffect$ | async) ?? true"></div>
                    </div>
                  </label>
                </div>
                
                <div class="absolute left-0 right-0 -bottom-2 translate-y-full opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
                  <div class="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs p-2 rounded-lg shadow-lg mt-2 border border-slate-300 dark:border-slate-600">
                    <p class="font-semibold mb-1">Why disable?</p>
                    <p class="text-slate-700 dark:text-slate-300">Most performance-intensive effect. Biggest performance gain on low-end devices.</p>
                  </div>
                </div>
              </div>

              <!-- Performance Monitor -->
              <div class="relative group">
                <div class="flex items-center justify-between bg-white/60 dark:bg-slate-800/60 rounded-lg p-3 shadow-sm">
                  <div class="flex-1 pr-3">
                    <div class="text-sm font-medium text-slate-700 dark:text-slate-300 font-inter">Performance Monitor</div>
                    <div class="text-xs text-slate-600 dark:text-slate-400 font-inter">Real-time metrics overlay (Ctrl+Shift+P)</div>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="sr-only peer" 
                      [checked]="(showPerformanceMonitor$ | async) ?? false" 
                      (change)="onTogglePerformanceMonitor($event)" 
                    />
                    <div class="relative w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-600 toggle-bg transition-colors">
                      <div class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transform transition-transform" [class.translate-x-4]="(showPerformanceMonitor$ | async) ?? false"></div>
                    </div>
                  </label>
                </div>
                
                <div class="absolute left-0 right-0 -bottom-2 translate-y-full opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
                  <div class="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs p-2 rounded-lg shadow-lg mt-2 border border-slate-300 dark:border-slate-600">
                    <p class="font-semibold mb-1">What does this do?</p>
                    <p class="text-slate-700 dark:text-slate-300">Draggable overlay with FPS, memory, CPU, DOM stats, and network activity.</p>
                  </div>
                </div>
              </div>

              <!-- Performance Monitor Theme Color -->
              <div class="bg-white/60 dark:bg-slate-800/60 rounded-lg p-3 shadow-sm">
                <div class="mb-2">
                  <div class="text-sm font-medium text-slate-700 dark:text-slate-300 font-inter">Monitor Theme Color</div>
                  <div class="text-xs text-slate-600 dark:text-slate-400 font-inter">Customize overlay color</div>
                </div>
                
                <!-- Color Picker -->
                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-2">
                    <label class="relative cursor-pointer group">
                      <input 
                        type="color" 
                        [value]="(performanceMonitorThemeColor$ | async) ?? '#c77dff'"
                        (input)="onChangeThemeColor($any($event.target).value)"
                        class="sr-only"
                      />
                      <div 
                        class="w-12 h-12 rounded-lg border-2 border-white dark:border-slate-600 shadow-lg transition-transform group-hover:scale-105 cursor-pointer"
                        [style.background-color]="(performanceMonitorThemeColor$ | async) ?? '#c77dff'"
                        [style.box-shadow]="'0 0 15px ' + ((performanceMonitorThemeColor$ | async) ?? '#c77dff') + '80'"
                      ></div>
                      <div class="absolute -bottom-1 -right-1 bg-slate-700 text-white text-xs px-1.5 py-0.5 rounded shadow">
                        Pick
                      </div>
                    </label>
                    <div class="flex flex-col gap-0.5">
                      <span class="text-xs font-medium text-slate-700 dark:text-slate-300 font-inter">{{ (performanceMonitorThemeColor$ | async) ?? '#c77dff' }}</span>
                      <span class="text-xs text-slate-600 dark:text-slate-400 font-inter">Click square to change</span>
                    </div>
                  </div>
                  
                  <!-- Reset Button -->
                  <button
                    (click)="onResetThemeColor()"
                    class="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors shadow-sm font-inter"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Animation Settings -->
          <div class="mt-6">
            <h2 class="text-base font-semibold text-slate-700 dark:text-slate-300 mb-2 font-outfit">Animation Settings</h2>
            
            <!-- Background Animation Toggle -->
            <div class="flex items-center justify-between bg-white/60 dark:bg-slate-800/60 rounded-lg p-3 shadow-sm">
              <div>
                <div class="text-sm font-medium text-slate-700 dark:text-slate-300 font-inter">Background Animation</div>
                <div class="text-xs text-slate-600 dark:text-slate-400 font-inter">Animated particles with connecting lines</div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  class="sr-only peer" 
                  [checked]="(enableBackgroundAnimation$ | async) ?? true" 
                  (change)="onToggleBackgroundAnimation($event)" 
                />
                <div class="relative w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-600 toggle-bg transition-colors">
                  <div class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transform transition-transform" [class.translate-x-4]="(enableBackgroundAnimation$ | async) ?? true"></div>
                </div>
              </label>
            </div>
          </div>

          <!-- Advanced Animation Settings -->
          <div class="mt-6">
            <div 
              class="flex items-center justify-between cursor-pointer mb-2 p-2 rounded-lg hover:bg-white/30 dark:hover:bg-slate-700/30 transition-colors"
              (click)="toggleAdvancedSettings()"
            >
              <h2 class="text-base font-semibold text-slate-700 dark:text-slate-300 font-outfit">Advanced Animation Settings</h2>
              <svg 
                class="w-5 h-5 text-slate-700 dark:text-slate-300 transition-transform duration-200"
                [class.rotate-180]="isAdvancedSettingsExpanded"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
            
            <div 
              class="space-y-3 overflow-hidden transition-all duration-300"
              [class.max-h-0]="!isAdvancedSettingsExpanded"
              [class.max-h-[3500px]]="isAdvancedSettingsExpanded"
              [class.opacity-0]="!isAdvancedSettingsExpanded"
              [class.opacity-100]="isAdvancedSettingsExpanded"
            >
              <!-- Physics Toggles -->
              <div class="bg-white/60 dark:bg-slate-800/60 rounded-lg p-3 shadow-sm">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">

                  <!-- Magnetic Force Toggle -->
                  <div class="flex items-center justify-between p-3 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 shadow-sm">
                    <div class="flex-1">
                      <div class="text-xs font-semibold text-slate-700 dark:text-slate-300 font-inter">Magnetic Attraction</div>
                      <div class="text-[10px] text-slate-600 dark:text-slate-400 font-inter">Pull particles together</div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer ml-2">
                      <input 
                        type="checkbox" 
                        class="sr-only peer" 
                        [checked]="(enableMagneticForce$ | async) ?? true" 
                        (change)="onToggleMagneticForce($event)" 
                      />
                      <div class="relative w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-600 toggle-bg transition-colors">
                        <div class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transform transition-transform" [class.translate-x-4]="(enableMagneticForce$ | async) ?? true"></div>
                      </div>
                    </label>
                  </div>

                  <!-- Repulsion Force Toggle -->
                  <div class="flex items-center justify-between p-3 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 shadow-sm">
                    <div class="flex-1">
                      <div class="text-xs font-semibold text-slate-700 dark:text-slate-300 font-inter">Repulsion Force</div>
                      <div class="text-[10px] text-slate-600 dark:text-slate-400 font-inter">Push apart when close</div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer ml-2">
                      <input 
                        type="checkbox" 
                        class="sr-only peer" 
                        [checked]="(enableRepulsionForce$ | async) ?? true" 
                        (change)="onToggleRepulsionForce($event)" 
                      />
                      <div class="relative w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-600 toggle-bg transition-colors">
                        <div class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transform transition-transform" [class.translate-x-4]="(enableRepulsionForce$ | async) ?? true"></div>
                      </div>
                    </label>
                  </div>

                  <!-- Damping Toggle -->
                  <div class="flex items-center justify-between p-3 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 shadow-sm">
                    <div class="flex-1">
                      <div class="text-xs font-semibold text-slate-700 dark:text-slate-300 font-inter">Velocity Damping</div>
                      <div class="text-[10px] text-slate-600 dark:text-slate-400 font-inter">Simulate air resistance</div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer ml-2">
                      <input 
                        type="checkbox" 
                        class="sr-only peer" 
                        [checked]="(enableDamping$ | async) ?? true" 
                        (change)="onToggleDamping($event)" 
                      />
                      <div class="relative w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-600 toggle-bg transition-colors">
                        <div class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transform transition-transform" [class.translate-x-4]="(enableDamping$ | async) ?? true"></div>
                      </div>
                    </label>
                  </div>

                  <!-- Brownian Motion Toggle -->
                  <div class="flex items-center justify-between p-3 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 shadow-sm">
                    <div class="flex-1">
                      <div class="text-xs font-semibold text-slate-700 dark:text-slate-300 font-inter">Brownian Motion</div>
                      <div class="text-[10px] text-slate-600 dark:text-slate-400 font-inter">Random jittering</div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer ml-2">
                      <input 
                        type="checkbox" 
                        class="sr-only peer" 
                        [checked]="(enableBrownianMotion$ | async) ?? true" 
                        (change)="onToggleBrownianMotion($event)" 
                      />
                      <div class="relative w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-600 toggle-bg transition-colors">
                        <div class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transform transition-transform" [class.translate-x-4]="(enableBrownianMotion$ | async) ?? true"></div>
                      </div>
                    </label>
                  </div>

                  <!-- Cluster Breaking Toggle -->
                  <div class="flex items-center justify-between p-3 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 shadow-sm">
                    <div class="flex-1">
                      <div class="text-xs font-semibold text-slate-700 dark:text-slate-300 font-inter">Cluster Breaking</div>
                      <div class="text-[10px] text-slate-600 dark:text-slate-400 font-inter">Explode dense groups</div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer ml-2">
                      <input 
                        type="checkbox" 
                        class="sr-only peer" 
                        [checked]="(enableClusterBreaking$ | async) ?? true" 
                        (change)="onToggleClusterBreaking($event)" 
                      />
                      <div class="relative w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-600 toggle-bg transition-colors">
                        <div class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transform transition-transform" [class.translate-x-4]="(enableClusterBreaking$ | async) ?? true"></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Fine-Tune Parameters -->
              <div class="bg-white/60 dark:bg-slate-800/60 rounded-lg p-4 shadow-sm">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300 font-inter">Fine-Tune Parameters</h3>
                  <button
                    (click)="onResetAnimationSettings()"
                    class="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-inter"
                  >
                    Reset to Defaults
                  </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                  <!-- All sliders in one flat grid - 4 columns on desktop, 2 on tablet, 1 on mobile -->
                  
                  <div class="bg-white/60 dark:bg-slate-800/60 rounded p-2">
                    <label class="text-xs font-medium text-slate-700 dark:text-slate-300 font-inter">Particles: {{numPoints$ | async}}</label>
                    <div class="text-[9px] text-slate-500 dark:text-slate-500 font-inter mb-1">Total number of particles</div>
                    <input type="range" min="20" max="2000" step="10" 
                      [value]="numPoints$ | async"
                      (input)="onNumPointsChange(+$any($event.target).value)"
                      class="w-full h-1 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer slider" />
                  </div>

                  <div class="bg-white/60 dark:bg-slate-800/60 rounded p-2">
                    <label class="text-xs font-medium text-slate-700 dark:text-slate-300 font-inter">Connection Range: {{connectionRadius$ | async}}</label>
                    <div class="text-[9px] text-slate-500 dark:text-slate-500 font-inter mb-1">Max distance for lines (in pixels)</div>
                    <input type="range" min="50" max="400" step="5" 
                      [value]="connectionRadius$ | async"
                      (input)="onConnectionRadiusChange(+$any($event.target).value)"
                      class="w-full h-1 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer slider" />
                  </div>

                  <div class="bg-white/60 dark:bg-slate-800/60 rounded p-2">
                    <label class="text-xs font-medium text-slate-700 dark:text-slate-300 font-inter">Dot Size: {{pointsSize$ | async}}</label>
                    <div class="text-[9px] text-slate-500 dark:text-slate-500 font-inter mb-1">Particle radius (in pixels)</div>
                    <input type="range" min="1" max="15" step="0.5" 
                      [value]="pointsSize$ | async"
                      (input)="onPointsSizeChange(+$any($event.target).value)"
                      class="w-full h-1 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer slider" />
                  </div>

                  <div class="bg-white/60 dark:bg-slate-800/60 rounded p-2">
                    <label class="text-xs font-medium text-slate-700 dark:text-slate-300 font-inter">Line Width: {{lineWidth$ | async}}</label>
                    <div class="text-[9px] text-slate-500 dark:text-slate-500 font-inter mb-1">Connection thickness (in pixels)</div>
                    <input type="range" min="1" max="15" step="0.5" 
                      [value]="lineWidth$ | async"
                      (input)="onLineWidthChange(+$any($event.target).value)"
                      class="w-full h-1 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer slider" />
                  </div>

                  <div class="bg-white/60 dark:bg-slate-800/60 rounded p-2">
                    <label class="text-xs font-medium text-slate-700 dark:text-slate-300 font-inter">Min Speed: {{minSpeed$ | async | number:'1.2-2'}}</label>
                    <div class="text-[9px] text-slate-500 dark:text-slate-500 font-inter mb-1">Minimum velocity (px/frame)</div>
                    <input type="range" min="0.05" max="1" step="0.01" 
                      [value]="minSpeed$ | async"
                      (input)="onMinSpeedChange(+$any($event.target).value)"
                      class="w-full h-1 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer slider" />
                  </div>

                  <div class="bg-white/60 dark:bg-slate-800/60 rounded p-2">
                    <label class="text-xs font-medium text-slate-700 dark:text-slate-300 font-inter">Max Speed: {{maxSpeed$ | async | number:'1.2-2'}}</label>
                    <div class="text-[9px] text-slate-500 dark:text-slate-500 font-inter mb-1">Maximum velocity (px/frame)</div>
                    <input type="range" min="0.2" max="2" step="0.02" 
                      [value]="maxSpeed$ | async"
                      (input)="onMaxSpeedChange(+$any($event.target).value)"
                      class="w-full h-1 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer slider" />
                  </div>

                  <div class="bg-white/60 dark:bg-slate-800/60 rounded p-2">
                    <label class="text-xs font-medium text-slate-700 dark:text-slate-300 font-inter">Magnetic Range: {{magneticRadius$ | async}}</label>
                    <div class="text-[9px] text-slate-500 dark:text-slate-500 font-inter mb-1">Attraction distance (in pixels)</div>
                    <input type="range" min="20" max="200" step="2" 
                      [value]="magneticRadius$ | async"
                      (input)="onMagneticRadiusChange(+$any($event.target).value)"
                      class="w-full h-1 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer slider" />
                  </div>

                  <div class="bg-white/60 dark:bg-slate-800/60 rounded p-2">
                    <label class="text-xs font-medium text-slate-700 dark:text-slate-300 font-inter">Magnetic Strength: {{magneticStrength$ | async | number:'1.4-4'}}</label>
                    <div class="text-[9px] text-slate-500 dark:text-slate-500 font-inter mb-1">Pull-together force</div>
                    <input type="range" min="0.0001" max="0.005" step="0.0001" 
                      [value]="magneticStrength$ | async"
                      (input)="onMagneticStrengthChange(+$any($event.target).value)"
                      class="w-full h-1 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer slider" />
                  </div>

                  <div class="bg-white/60 dark:bg-slate-800/60 rounded p-2">
                    <label class="text-xs font-medium text-slate-700 dark:text-slate-300 font-inter">Repulsion Range: {{repulsionRadius$ | async}}</label>
                    <div class="text-[9px] text-slate-500 dark:text-slate-500 font-inter mb-1">Push-apart distance (in pixels)</div>
                    <input type="range" min="5" max="100" step="2" 
                      [value]="repulsionRadius$ | async"
                      (input)="onRepulsionRadiusChange(+$any($event.target).value)"
                      class="w-full h-1 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer slider" />
                  </div>

                  <div class="bg-white/60 dark:bg-slate-800/60 rounded p-2">
                    <label class="text-xs font-medium text-slate-700 dark:text-slate-300 font-inter">Repulsion Strength: {{repulsionStrength$ | async | number:'1.1-1'}}</label>
                    <div class="text-[9px] text-slate-500 dark:text-slate-500 font-inter mb-1">Push-apart force</div>
                    <input type="range" min="0.1" max="5" step="0.1" 
                      [value]="repulsionStrength$ | async"
                      (input)="onRepulsionStrengthChange(+$any($event.target).value)"
                      class="w-full h-1 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer slider" />
                  </div>

                  <div class="bg-white/60 dark:bg-slate-800/60 rounded p-2">
                    <label class="text-xs font-medium text-slate-700 dark:text-slate-300 font-inter">Damping: {{dampingFactor$ | async | number:'1.3-3'}}</label>
                    <div class="text-[9px] text-slate-500 dark:text-slate-500 font-inter mb-1">Air resistance (higher = slower stop)</div>
                    <input type="range" min="0.80" max="0.999" step="0.001" 
                      [value]="dampingFactor$ | async"
                      (input)="onDampingFactorChange(+$any($event.target).value)"
                      class="w-full h-1 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer slider" />
                  </div>

                  <div class="bg-white/60 dark:bg-slate-800/60 rounded p-2">
                    <label class="text-xs font-medium text-slate-700 dark:text-slate-300 font-inter">Brownian Motion: {{brownianStrength$ | async | number:'1.3-3'}}</label>
                    <div class="text-[9px] text-slate-500 dark:text-slate-500 font-inter mb-1">Random jittering</div>
                    <input type="range" min="0" max="0.1" step="0.002" 
                      [value]="brownianStrength$ | async"
                      (input)="onBrownianStrengthChange(+$any($event.target).value)"
                      class="w-full h-1 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer slider" />
                  </div>

                  <div class="bg-white/60 dark:bg-slate-800/60 rounded p-2">
                    <label class="text-xs font-medium text-slate-700 dark:text-slate-300 font-inter">Detection Range: {{clusterThreshold$ | async}}</label>
                    <div class="text-[9px] text-slate-500 dark:text-slate-500 font-inter mb-1">Cluster proximity (in pixels)</div>
                    <input type="range" min="1" max="100" step="2" 
                      [value]="clusterThreshold$ | async"
                      (input)="onClusterThresholdChange(+$any($event.target).value)"
                      class="w-full h-1 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer slider" />
                  </div>

                  <div class="bg-white/60 dark:bg-slate-800/60 rounded p-2">
                    <label class="text-xs font-medium text-slate-700 dark:text-slate-300 font-inter">Explosion Strength: {{explosionForce$ | async | number:'1.0-0'}}</label>
                    <div class="text-[9px] text-slate-500 dark:text-slate-500 font-inter mb-1">How powerfully clusters explode</div>
                    <input type="range" min="10" max="1000" step="10" 
                      [value]="explosionForce$ | async"
                      (input)="onExplosionForceChange(+$any($event.target).value)"
                      class="w-full h-1 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer slider" />
                  </div>

                  <div class="bg-white/60 dark:bg-slate-800/60 rounded p-2">
                    <label class="text-xs font-medium text-slate-700 dark:text-slate-300 font-inter">Check Frequency: {{clusterCheckInterval$ | async}}</label>
                    <div class="text-[9px] text-slate-500 dark:text-slate-500 font-inter mb-1">Wait time (in frames, 180 = 3s @ 60fps)</div>
                    <input type="range" min="30" max="600" step="10" 
                      [value]="clusterCheckInterval$ | async"
                      (input)="onClusterCheckIntervalChange(+$any($event.target).value)"
                      class="w-full h-1 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer slider" />
                  </div>

                  <div class="bg-white/60 dark:bg-slate-800/60 rounded p-2">
                    <label class="text-xs font-medium text-slate-700 dark:text-slate-300 font-inter">Trigger Count: {{minClusterSize$ | async}}</label>
                    <div class="text-[9px] text-slate-500 dark:text-slate-500 font-inter mb-1">Particles needed to explode</div>
                    <input type="range" min="2" max="20" step="1" 
                      [value]="minClusterSize$ | async"
                      (input)="onMinClusterSizeChange(+$any($event.target).value)"
                      class="w-full h-1 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer slider" />
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

    /* Style toggle switches with theme colors - only when checked */
    input[type="checkbox"]:checked ~ .toggle-bg {
      background-color: var(--color-dark-primary) !important;
    }

    /* Style range input sliders with theme colors */
    input[type="range"].slider {
      -webkit-appearance: none;
      appearance: none;
    }

    /* Webkit browsers (Chrome, Safari, Edge) */
    input[type="range"].slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.2s ease;
      background: var(--color-dark-primary);
      border: none;
      box-shadow: 0 0 0 6px var(--color-dark-primary-hover);
    }

    /* Hover effect */
    input[type="range"].slider::-webkit-slider-thumb:hover {
      transform: scale(1.1);
    }

    /* Firefox */
    input[type="range"].slider::-moz-range-thumb {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
      background: var(--color-dark-primary);
      box-shadow: 0 0 0 6px var(--color-dark-primary-hover);
    }

    /* Hover effect */
    input[type="range"].slider::-moz-range-thumb:hover {
      transform: scale(1.1);
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
  readonly enableBackgroundAnimation$ = this.store.select(selectEnableBackgroundAnimation).pipe(shareReplay(1));
  
  // Particle physics observables
  readonly enableMagneticForce$ = this.store.select(selectEnableMagneticForce).pipe(shareReplay(1));
  readonly enableRepulsionForce$ = this.store.select(selectEnableRepulsionForce).pipe(shareReplay(1));
  readonly enableDamping$ = this.store.select(selectEnableDamping).pipe(shareReplay(1));
  readonly enableBrownianMotion$ = this.store.select(selectEnableBrownianMotion).pipe(shareReplay(1));
  readonly enableClusterBreaking$ = this.store.select(selectEnableClusterBreaking).pipe(shareReplay(1));

  // UI state for expandable sections
  public isAdvancedSettingsExpanded = false;
  
  // Animation configuration observables
  readonly numPoints$ = this.store.select(selectNumPoints).pipe(shareReplay(1));
  readonly connectionRadius$ = this.store.select(selectConnectionRadius).pipe(shareReplay(1));
  readonly magneticRadius$ = this.store.select(selectMagneticRadius).pipe(shareReplay(1));
  readonly magneticStrength$ = this.store.select(selectMagneticStrength).pipe(shareReplay(1));
  readonly minSpeed$ = this.store.select(selectMinSpeed).pipe(shareReplay(1));
  readonly maxSpeed$ = this.store.select(selectMaxSpeed).pipe(shareReplay(1));
  readonly pointsSize$ = this.store.select(selectPointsSize).pipe(shareReplay(1));
  readonly lineWidth$ = this.store.select(selectLineWidth).pipe(shareReplay(1));
  readonly repulsionRadius$ = this.store.select(selectRepulsionRadius).pipe(shareReplay(1));
  readonly repulsionStrength$ = this.store.select(selectRepulsionStrength).pipe(shareReplay(1));
  readonly dampingFactor$ = this.store.select(selectDampingFactor).pipe(shareReplay(1));
  readonly brownianStrength$ = this.store.select(selectBrownianStrength).pipe(shareReplay(1));
  readonly clusterThreshold$ = this.store.select(selectClusterThreshold).pipe(shareReplay(1));
  readonly explosionForce$ = this.store.select(selectExplosionForce).pipe(shareReplay(1));
  readonly clusterCheckInterval$ = this.store.select(selectClusterCheckInterval).pipe(shareReplay(1));
  readonly minClusterSize$ = this.store.select(selectMinClusterSize).pipe(shareReplay(1));

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

  public onToggleBackgroundAnimation(_event: Event): void {
    this.store.dispatch(toggleBackgroundAnimation());
  }

  public onToggleMagneticForce(_event: Event): void {
    this.store.dispatch(toggleMagneticForce());
  }

  public onToggleRepulsionForce(_event: Event): void {
    this.store.dispatch(toggleRepulsionForce());
  }

  public onToggleDamping(_event: Event): void {
    this.store.dispatch(toggleDamping());
  }

  public onToggleBrownianMotion(_event: Event): void {
    this.store.dispatch(toggleBrownianMotion());
  }

  public onToggleClusterBreaking(_event: Event): void {
    this.store.dispatch(toggleClusterBreaking());
  }

  public toggleAdvancedSettings(): void {
    this.isAdvancedSettingsExpanded = !this.isAdvancedSettingsExpanded;
  }

  // Animation configuration handlers
  public onNumPointsChange(value: number): void {
    this.store.dispatch(setNumPoints({ value }));
  }

  public onConnectionRadiusChange(value: number): void {
    this.store.dispatch(setConnectionRadius({ value }));
  }

  public onMagneticRadiusChange(value: number): void {
    this.store.dispatch(setMagneticRadius({ value }));
  }

  public onMagneticStrengthChange(value: number): void {
    this.store.dispatch(setMagneticStrengthValue({ value }));
  }

  public onMinSpeedChange(value: number): void {
    this.store.dispatch(setMinSpeed({ value }));
  }

  public onMaxSpeedChange(value: number): void {
    this.store.dispatch(setMaxSpeed({ value }));
  }

  public onPointsSizeChange(value: number): void {
    this.store.dispatch(setPointsSize({ value }));
  }

  public onLineWidthChange(value: number): void {
    this.store.dispatch(setLineWidth({ value }));
  }

  public onRepulsionRadiusChange(value: number): void {
    this.store.dispatch(setRepulsionRadiusValue({ value }));
  }

  public onRepulsionStrengthChange(value: number): void {
    this.store.dispatch(setRepulsionStrengthValue({ value }));
  }

  public onDampingFactorChange(value: number): void {
    this.store.dispatch(setDampingFactorValue({ value }));
  }

  public onBrownianStrengthChange(value: number): void {
    this.store.dispatch(setBrownianStrengthValue({ value }));
  }

  public onClusterThresholdChange(value: number): void {
    this.store.dispatch(setClusterThresholdValue({ value }));
  }

  public onExplosionForceChange(value: number): void {
    this.store.dispatch(setExplosionForceValue({ value }));
  }

  public onClusterCheckIntervalChange(value: number): void {
    this.store.dispatch(setClusterCheckIntervalValue({ value }));
  }

  public onMinClusterSizeChange(value: number): void {
    this.store.dispatch(setMinClusterSizeValue({ value }));
  }

  public onResetAnimationSettings(): void {
    this.store.dispatch(resetAnimationSettings());
  }
}
