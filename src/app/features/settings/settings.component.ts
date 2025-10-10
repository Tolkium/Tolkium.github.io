import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectHideScrollbar } from '../../core/store/ui.selectors';
import { setHideScrollbar, toggleHideScrollbar } from '../../core/store/ui.actions';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="p-6 text-slate-800 dark:text-slate-200">
    <h1 class="text-2xl font-semibold mb-4">Settings</h1>

    <div class="flex items-center justify-between bg-white/60 dark:bg-slate-800/60 rounded-lg p-4 shadow-sm">
      <div>
        <div class="font-medium">Hide page scrollbar</div>
        <div class="text-sm text-slate-600 dark:text-slate-400">Default: hidden. Persists in your browser.</div>
      </div>
      <label class="inline-flex items-center cursor-pointer">
        <input type="checkbox" class="sr-only peer" [checked]="(hideScrollbar$ | async) ?? true" (change)="onToggle($event)" />
        <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-600 peer-checked:bg-[#8833cc] transition-colors"></div>
        <div class="-ml-8 w-5 h-5 bg-white rounded-full shadow transform transition-transform" [class.translate-x-5]="(hideScrollbar$ | async) ?? true"></div>
      </label>
    </div>
  </div>
  `,
  styles: [
  ]
})
export class SettingsComponent {
  hideScrollbar$ = this.store.select(selectHideScrollbar);

  constructor(private store: Store) {
    // Apply default on load from localStorage or default true
    const saved = localStorage.getItem('hideScrollbar');
    const hide = saved ? JSON.parse(saved) : true;
    this.store.dispatch(setHideScrollbar({ hideScrollbar: hide }));
  }

  public onToggle(_event: Event): void {
    // Toggle the current state
    this.store.dispatch(toggleHideScrollbar());
  }
}
