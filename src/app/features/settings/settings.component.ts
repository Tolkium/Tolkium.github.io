import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectHideScrollbar } from '../../core/store/ui.selectors';
import { toggleHideScrollbar } from '../../core/store/ui.actions';
import { BackgroundAnimationComponent } from '../../shared/components/background-animation/background-animation.component';
import { DarkModeToggleComponent } from '../../layout/dark-mode-toggle/dark-mode-toggle.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, BackgroundAnimationComponent, DarkModeToggleComponent],
  template: `
  <div class="relative">
    <div class="fixed inset-0 z-0">
      <app-background-animation></app-background-animation>
    </div>

    <div class="relative z-10">
      <div class="fixed top-4 right-4 z-40 hidden md:block">
        <app-dark-mode-toggle></app-dark-mode-toggle>
      </div>

      <div class="container mx-auto px-2 py-2 md:py-0 md:px-0 max-w-4xl">
        <div class="bg-white/50 dark:bg-slate-800/50 p-6 rounded-lg shadow-md backdrop-blur-sm">
          <h1 class="text-2xl font-bold text-[#f29f67]/90 dark:text-[#8833cc]/70 mb-6 font-outfit">Settings</h1>

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
                (change)="onToggle($event)" 
              />
              <div class="relative w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-600 peer-checked:bg-[#8833cc] transition-colors">
                <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform" [class.translate-x-5]="(hideScrollbar$ | async) ?? true"></div>
              </div>
            </label>
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
  
  hideScrollbar$ = this.store.select(selectHideScrollbar);

  public onToggle(_event: Event): void {
    // Toggle the current state
    this.store.dispatch(toggleHideScrollbar());
  }
}
