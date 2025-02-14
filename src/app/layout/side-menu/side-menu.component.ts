import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { SideMenuItemComponent } from '../../layout/side-menu-item/side-menu-item.component';
import { DarkModeToggleComponent } from '../dark-mode-toggle/dark-mode-toggle.component';
import { MENU_SECTIONS } from '../../models/menu-data';
import { MenuItem } from '../../models/menu-section';
import * as UiActions from '../../core/store/ui.actions';
import * as UiSelectors from '../../core/store/ui.selectors';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [CommonModule, SideMenuItemComponent, DarkModeToggleComponent],
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss']
})
export class SideMenuComponent {
  isCollapsed$ = this.store.select(UiSelectors.selectIsMenuCollapsed).pipe(
    map(isCollapsed => isCollapsed ?? true)
  );

  isMobile$ = this.store.select(UiSelectors.selectIsMobile).pipe(
    map(isMobile => isMobile ?? false)
  );

  isDarkMode$ = this.store.select(UiSelectors.selectIsDarkMode).pipe(
    map(isDarkMode => isDarkMode ?? false)
  );

  menuSections = MENU_SECTIONS;

  darkModeToggleItem: MenuItem = {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24"><path fill="currentColor" d="M11.01 3.05C6.51 3.54 3 7.36 3 12a9 9 0 0 0 9 9c4.63 0 8.45-3.5 8.95-8c.09-.79-.78-1.42-1.54-.95A5.403 5.403 0 0 1 11.1 7.5c0-1.06.31-2.06.84-2.89c.45-.67-.04-1.63-.93-1.56z"/></svg>',
    label: 'Toggle Dark Mode',
    route: ''
  };

  darkModeToggleLightItem: MenuItem = {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24"><path fill="currentColor" d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5s5-2.24 5-5s-2.24-5-5-5M2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1m18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1M11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1m0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1M5.99 4.58a.996.996 0 0 0-1.41 0a.996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58m12.37 12.37a.996.996 0 0 0-1.41 0a.996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41l-1.06-1.06m1.06-10.96a.996.996 0 0 0 0-1.41a.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06M7.05 18.36a.996.996 0 0 0 0-1.41a.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>',
    label: 'Toggle Dark Mode',
    route: ''
  };

  constructor(private store: Store) {
    this.checkMobileState();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkMobileState();
  }

  private checkMobileState(): void {
    const isMobile = window.innerWidth < 768;
    this.store.dispatch(UiActions.setMobileState({ isMobile }));
    if (!isMobile) {
      this.store.dispatch(UiActions.setMenuCollapse({ isCollapsed: true }));
    }
  }

  toggleCollapse(): void {
    this.store.dispatch(UiActions.toggleMenuCollapse());
  }

  toggleDarkMode(): void {
    this.store.dispatch(UiActions.toggleDarkMode());
  }

  onMenuItemClick(): void {
    this.isMobile$.subscribe(isMobile => {
      if (isMobile) {
        this.store.dispatch(UiActions.setMenuCollapse({ isCollapsed: true }));
      }
    }).unsubscribe();
  }
}
