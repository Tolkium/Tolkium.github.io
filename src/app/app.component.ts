import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { SideMenuComponent } from './layout/side-menu/side-menu.component';
import * as UiSelectors from './core/store/ui.selectors';
import * as UiActions from './core/store/ui.actions';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SideMenuComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isMenuCollapsed$ = this.store.select(UiSelectors.selectIsMenuCollapsed).pipe(
    map(isCollapsed => isCollapsed ?? true)
  );

  isMobile$ = this.store.select(UiSelectors.selectIsMobile).pipe(
    map(isMobile => isMobile ?? false)
  );

  constructor(private store: Store) {}

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
  }

  private checkMobileState(): void {
    const isMobile = window.innerWidth < 768;
    this.store.dispatch(UiActions.setMobileState({ isMobile }));
  }
}
