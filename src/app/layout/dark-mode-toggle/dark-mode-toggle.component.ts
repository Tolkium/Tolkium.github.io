import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import * as UiActions from '../../core/store/ui.actions';
import * as UiSelectors from '../../core/store/ui.selectors';

@Component({
  selector: 'app-dark-mode-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [class]="buttonClass"
      (click)="toggleDarkMode()"
      aria-label="Toggle dark mode">
      @if (isDarkMode$ | async) {
        <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5s5-2.24 5-5s-2.24-5-5-5M2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1m18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1M11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1m0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1M5.99 4.58a.996.996 0 0 0-1.41 0a.996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58m12.37 12.37a.996.996 0 0 0-1.41 0a.996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41l-1.06-1.06m1.06-10.96a.996.996 0 0 0 0-1.41a.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06M7.05 18.36a.996.996 0 0 0 0-1.41a.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
        </svg>
      } @else {
        <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24">
          <path fill="currentColor" d="M11.01 3.05C6.51 3.54 3 7.36 3 12a9 9 0 0 0 9 9c4.63 0 8.45-3.5 8.95-8c.09-.79-.78-1.42-1.54-.95A5.403 5.403 0 0 1 11.1 7.5c0-1.06.31-2.06.84-2.89c.45-.67-.04-1.63-.93-1.56z"/>
        </svg>
      }
    </button>
  `,
  styles: [`
    :host {
      display: block;
    }

    .icon {
      width: 1.5rem;
      height: 1.5rem;
    }

    .desktop-button {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 60;
      padding: 0.5rem;
      border-radius: 0.5rem;
      background-color: var(--color-bg-light);
      color: var(--color-text-light);
      transition: all 0.2s ease-in-out;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      backdrop-filter: blur(8px);

      &:hover {
        background-color: var(--hover-bg-color);
        color: var(--hover-text-color);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .dark & {
        background-color: var(--color-bg-dark);
        color: var(--color-text-dark);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

        &:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
      }

      @media (max-width: 767px) {
        display: none;
      }
    }

    .mobile-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 0.75rem;
      color: var(--color-text-light);
      transition: all 0.2s ease-in-out;

      &:hover {
        background-color: var(--hover-bg-color);
        color: var(--hover-text-color);
      }

      .dark & {
        color: var(--color-text-dark);
      }

      .icon {
        margin-right: 0.75rem;
      }
    }
  `]
})
export class DarkModeToggleComponent {
  @Input() isMobile = false;

  isDarkMode$ = this.store.select(UiSelectors.selectIsDarkMode).pipe(
    map(isDarkMode => isDarkMode ?? false)
  );

  get buttonClass(): string {
    return this.isMobile ? 'mobile-button' : 'desktop-button';
  }

  constructor(private store: Store) {}

  toggleDarkMode(): void {
    this.store.dispatch(UiActions.toggleDarkMode());
  }
}
