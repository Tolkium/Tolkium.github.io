import { Component, OnInit, HostListener, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { map, shareReplay } from 'rxjs/operators';
import { SideMenuComponent } from './layout/side-menu/side-menu.component';
import { DarkModeToggleComponent } from './layout/dark-mode-toggle/dark-mode-toggle.component';
import { PerformanceMonitorComponent } from './shared/components/performance-monitor/performance-monitor.component';
import { BackgroundAnimationComponent } from './shared/components/background-animation/background-animation.component';
import * as UiSelectors from './core/store/ui.selectors';
import * as UiActions from './core/store/ui.actions';

@Component({
    selector: 'app-root',
    imports: [CommonModule, RouterOutlet, SideMenuComponent, DarkModeToggleComponent, PerformanceMonitorComponent, BackgroundAnimationComponent],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  private readonly store = inject(Store);

  readonly isMenuCollapsed$ = this.store.select(UiSelectors.selectIsMenuCollapsed).pipe(
    map(isCollapsed => isCollapsed ?? true),
    shareReplay(1)
  );

  readonly isMobile$ = this.store.select(UiSelectors.selectIsMobile).pipe(
    map(isMobile => isMobile ?? false),
    shareReplay(1)
  );

  readonly showPerformanceMonitor$ = this.store.select(UiSelectors.selectShowPerformanceMonitor).pipe(
    shareReplay(1)
  );

  public ngOnInit(): void {
    // Initialize dark mode from localStorage
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      this.store.dispatch(UiActions.setDarkMode({ isDarkMode: JSON.parse(savedDarkMode) }));
    }

    // Initialize menu collapse state from localStorage
    const savedMenuCollapse = localStorage.getItem('menuCollapsed');
    if (savedMenuCollapse) {
      this.store.dispatch(UiActions.setMenuCollapse({ isCollapsed: JSON.parse(savedMenuCollapse) }));
    }

    // Check system dark mode preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    if (!savedDarkMode && prefersDark.matches) {
      this.store.dispatch(UiActions.setDarkMode({ isDarkMode: true }));
    }

    // Listen for system dark mode changes
    prefersDark.addEventListener('change', (e) => {
      if (!localStorage.getItem('darkMode')) {
        this.store.dispatch(UiActions.setDarkMode({ isDarkMode: e.matches }));
      }
    });

    // Check initial mobile state
    this.checkMobileState();
    window.addEventListener('resize', () => this.checkMobileState());

    // Initialize scrollbar hidden: default ON unless localStorage explicitly false
    const savedScrollbarHidden = localStorage.getItem('hideScrollbar');
    const isHidden = savedScrollbarHidden === null ? true : JSON.parse(savedScrollbarHidden);
    this.store.dispatch(UiActions.setHideScrollbar({ hideScrollbar: isHidden }));
    if (isHidden) {
      document.documentElement.classList.add('scrollbar-hidden');
      document.body.classList.add('scrollbar-hidden');
    } else {
      document.documentElement.classList.remove('scrollbar-hidden');
      document.body.classList.remove('scrollbar-hidden');
    }

    // Initialize sparkle effect: default ON unless localStorage explicitly false
    const savedSparkleEffect = localStorage.getItem('enableSparkleEffect');
    const sparkleEnabled = savedSparkleEffect === null ? true : JSON.parse(savedSparkleEffect);
    this.store.dispatch(UiActions.setSparkleEffect({ enableSparkleEffect: sparkleEnabled }));

    // Initialize 3D tilt effect: default ON unless localStorage explicitly false
    const saved3DTiltEffect = localStorage.getItem('enable3DTiltEffect');
    const tiltEnabled = saved3DTiltEffect === null ? true : JSON.parse(saved3DTiltEffect);
    this.store.dispatch(UiActions.set3DTiltEffect({ enable3DTiltEffect: tiltEnabled }));

    // Initialize holographic effect: default ON unless localStorage explicitly false
    const savedHolographicEffect = localStorage.getItem('enableHolographicEffect');
    const holographicEnabled = savedHolographicEffect === null ? true : JSON.parse(savedHolographicEffect);
    this.store.dispatch(UiActions.setHolographicEffect({ enableHolographicEffect: holographicEnabled }));
  }

  private checkMobileState(): void {
    const isMobile = window.innerWidth < 768;
    this.store.dispatch(UiActions.setMobileState({ isMobile }));
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Ctrl+Shift+P to toggle performance monitor
    if (event.ctrlKey && event.shiftKey && event.key === 'P') {
      event.preventDefault();
      this.store.dispatch(UiActions.togglePerformanceMonitor());
    }
  }
}
