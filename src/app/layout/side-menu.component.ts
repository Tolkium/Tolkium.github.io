import { Component, Output, EventEmitter, HostListener } from '@angular/core';
import { SideMenuItemComponent } from './side-menu-item/side-menu-item.component';
import { MENU_SECTIONS } from '../models/menu-data';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [SideMenuItemComponent],
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss']
})
export class SideMenuComponent {
  isCollapsed = true;
  isMobile = window.innerWidth < 768;
  menuSections = MENU_SECTIONS;

  @Output() collapsedChange = new EventEmitter<boolean>();

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth < 768;
    if (!this.isMobile && !this.isCollapsed) {
      this.isCollapsed = true;
      this.collapsedChange.emit(this.isCollapsed);
    }
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.collapsedChange.emit(this.isCollapsed);
  }

  onMenuItemClick() {
    if (this.isMobile) {
      this.isCollapsed = true;
      this.collapsedChange.emit(this.isCollapsed);
    }
  }
}
