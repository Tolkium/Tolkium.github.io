import { Component, HostListener, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { map, take, tap, shareReplay } from 'rxjs/operators';
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
    styleUrls: ['./side-menu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SideMenuComponent {
  private readonly store = inject(Store);
  
  readonly isCollapsed$ = this.store.select(UiSelectors.selectIsMenuCollapsed).pipe(
    map(isCollapsed => isCollapsed ?? true),
    shareReplay(1)
  );

  readonly isMobile$ = this.store.select(UiSelectors.selectIsMobile).pipe(
    map(isMobile => isMobile ?? false),
    shareReplay(1)
  );

  readonly isDarkMode$ = this.store.select(UiSelectors.selectIsDarkMode).pipe(
    map(isDarkMode => isDarkMode ?? false),
    shareReplay(1)
  );

  menuSections = MENU_SECTIONS;

  darkModeToggleItem: MenuItem = {
    label: 'Dark Mode',
    iconName: 'heroMoon',
    route: ''
  };

  darkModeToggleLightItem: MenuItem = {
    label: 'Light Mode',
    iconName: 'heroSun',
    route: ''
  };

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
