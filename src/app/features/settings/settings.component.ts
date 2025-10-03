import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import * as UiSelectors from '../../core/store/ui.selectors';
import * as UiActions from '../../core/store/ui.actions';
import { DarkModeToggleComponent } from '../../layout/dark-mode-toggle/dark-mode-toggle.component';
import { BackgroundAnimationComponent } from '../../shared/components/background-animation/background-animation.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, DarkModeToggleComponent, BackgroundAnimationComponent],
  template: `
    <div class="relative">
      <div class="fixed inset-0 z-0">
        <app-background-animation></app-background-animation>
      </div>

      <div class="relative z-10 ">
        <div class="fixed top-4 right-4 z-40">
          <app-dark-mode-toggle></app-dark-mode-toggle>
        </div>

        <div class="container mx-auto px-2 py-2 md:py-0 md:px-0 max-w-4xl">
          <header class="bg-gradient-to-br from-[#f59656]/80 to-[#f59656]/80 dark:from-[#8833cc]/70 dark:to-[#8833cc]/70 text-white p-4 md:p-8 rounded-lg shadow-lg mb-4 md:mb-4 transition-colors duration-200 backdrop-blur-sm">
            <div class="text-center">
              <h1 class="text-3xl md:text-4xl font-bold mb-3 font-outfit">Settings</h1>
              <h2 class="text-base md:text-xl mb-3 text-indigo-100 font-inter">Customize your page preferences</h2>
            </div>
          </header>

          <main class="space-y-4">
            <section class="bg-white/50 dark:bg-slate-800/50 p-6 rounded-lg shadow-md hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm">
              <h2 class="text-2xl font-bold text-[#f29f67]/90 dark:text-[#8833cc]/70 mb-4 font-outfit">Appearance</h2>

              <div class="flex items-center justify-between py-2">
                <div>
                  <div class="text-slate-800 dark:text-slate-200 font-inter">Hide scrollbar</div>
                  <div class="text-sm text-slate-500 dark:text-slate-400 font-inter">Completely hides the browser scrollbar.</div>
                </div>
                <label class="inline-flex items-center cursor-pointer select-none">
                  <input type="checkbox" class="sr-only peer" [checked]="(isHidden$ | async)!" (change)="toggle()" />
                  <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full after:content-[''] after:w-5 after:h-5 after:bg-white after:rounded-full after:transition-all after:ml-0.5 after:mt-0.5 peer-checked:bg-[#8833cc] dark:peer-checked:bg-[#f29f67]"></div>
                </label>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  `,
})
export class SettingsComponent {
  isHidden$ = this.store.select(UiSelectors.selectIsScrollbarHidden).pipe(
    map(x => x ?? false)
  );

  constructor(private store: Store) {}

  toggle(): void {
    this.store.dispatch(UiActions.toggleScrollbarHidden());
  }
}
