import { ChangeDetectionStrategy, Component, DestroyRef, HostListener, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { fromEvent } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { SideMenuComponent } from './layout/side-menu/side-menu.component';
import { DarkModeToggleComponent } from './layout/dark-mode-toggle/dark-mode-toggle.component';
import { PerformanceMonitorComponent } from './shared/components/performance-monitor/performance-monitor.component';
import { BackgroundAnimationComponent } from './shared/components/background-animation/background-animation.component';
import { SearchComponent } from './shared/components/search/search.component';
import * as UiSelectors from './core/store/ui.selectors';
import * as UiActions from './core/store/ui.actions';

@Component({
    selector: 'app-root',
    imports: [CommonModule, RouterOutlet, SideMenuComponent, DarkModeToggleComponent, PerformanceMonitorComponent, BackgroundAnimationComponent, SearchComponent],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly destroyRef = inject(DestroyRef);

  readonly isMenuCollapsed$ = this.store.select(UiSelectors.selectIsMenuCollapsed).pipe(
    map((isCollapsed) => isCollapsed ?? true),
    shareReplay(1)
  );

  readonly isMobile$ = this.store.select(UiSelectors.selectIsMobile).pipe(
    map((isMobile) => isMobile ?? false),
    shareReplay(1)
  );

  readonly showPerformanceMonitor$ = this.store.select(UiSelectors.selectShowPerformanceMonitor).pipe(
    shareReplay(1)
  );

  public ngOnInit(): void {
    this.initializeTheme();
    this.initializeUiPreferences();
    this.checkMobileState();
  }

  private initializeTheme(): void {
    const savedDarkMode = this.readBooleanFromStorage('darkMode');
    if (savedDarkMode !== null) {
      this.store.dispatch(UiActions.setDarkMode({ isDarkMode: savedDarkMode }));
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    if (savedDarkMode === null && prefersDark.matches) {
      this.store.dispatch(UiActions.setDarkMode({ isDarkMode: true }));
    }

    fromEvent<MediaQueryListEvent>(prefersDark, 'change')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (this.readBooleanFromStorage('darkMode') === null) {
          this.store.dispatch(UiActions.setDarkMode({ isDarkMode: event.matches }));
        }
      });
  }

  private initializeUiPreferences(): void {
    const savedMenuCollapse = this.readBooleanFromStorage('menuCollapsed');
    if (savedMenuCollapse !== null) {
      this.store.dispatch(UiActions.setMenuCollapse({ isCollapsed: savedMenuCollapse }));
    }

    const isHidden = this.readBooleanFromStorage('hideScrollbar') ?? true;
    this.store.dispatch(UiActions.setHideScrollbar({ hideScrollbar: isHidden }));
    this.applyScrollbarClass(isHidden);

    const sparkleEnabled = this.readBooleanFromStorage('enableSparkleEffect') ?? true;
    this.store.dispatch(UiActions.setSparkleEffect({ enableSparkleEffect: sparkleEnabled }));

    const tiltEnabled = this.readBooleanFromStorage('enable3DTiltEffect') ?? true;
    this.store.dispatch(UiActions.set3DTiltEffect({ enable3DTiltEffect: tiltEnabled }));

    const holographicEnabled = this.readBooleanFromStorage('enableHolographicEffect') ?? true;
    this.store.dispatch(UiActions.setHolographicEffect({ enableHolographicEffect: holographicEnabled }));
  }

  private checkMobileState(): void {
    const isMobile = window.innerWidth < 768;
    this.store.dispatch(UiActions.setMobileState({ isMobile }));
  }

  private applyScrollbarClass(isHidden: boolean): void {
    document.documentElement.classList.toggle('scrollbar-hidden', isHidden);
    document.body.classList.toggle('scrollbar-hidden', isHidden);
  }

  private readBooleanFromStorage(key: string): boolean | null {
    const rawValue = localStorage.getItem(key);
    if (rawValue === null) {
      return null;
    }

    return JSON.parse(rawValue) as boolean;
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.checkMobileState();
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
