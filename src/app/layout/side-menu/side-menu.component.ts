import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { map, take, tap } from 'rxjs/operators';
import { SideMenuItemComponent } from '../../layout/side-menu-item/side-menu-item.component';
import { DarkModeToggleComponent } from '../dark-mode-toggle/dark-mode-toggle.component';
import { MENU_SECTIONS } from '../../models/menu-data';
import { MenuItem } from '../../models/menu-section';
import * as UiActions from '../../core/store/ui.actions';
import * as UiSelectors from '../../core/store/ui.selectors';
import { Subscription } from 'rxjs';

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
    label: 'Dark Mode',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24">
      <path fill="currentColor" d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
    </svg>`,
    route: ''
  };

  darkModeToggleLightItem: MenuItem = {
    label: 'Light Mode',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24">
      <path fill="currentColor" d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
    </svg>`,
    route: ''
  };

  constructor(private store: Store) {}

  @HostListener('window:resize')
  public onResize(): void {
    this.checkMobileState();
  }

  private checkMobileState(): void {
    const isMobile = window.innerWidth < 768;
    this.store.dispatch(UiActions.setMobileState({ isMobile }));
  }

  public toggleCollapse(): void {
    this.store.dispatch(UiActions.toggleMenuCollapse());
  }

  public toggleDarkMode(): void {
    this.store.dispatch(UiActions.toggleDarkMode());
  }

  public onMenuItemClick(): void {
    const subscription: Subscription = this.isMobile$.pipe(
      take(1),
      tap(isMobile => {
        if (isMobile) {
          this.store.dispatch(UiActions.setMenuCollapse({ isCollapsed: true }));
        }
      })
    ).subscribe(() => subscription.unsubscribe());
  }
}
