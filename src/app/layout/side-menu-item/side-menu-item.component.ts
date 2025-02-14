import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from '../../models/menu-section';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-side-menu-item',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './side-menu-item.component.html',
  styleUrls: ['./side-menu-item.component.scss']
})
export class SideMenuItemComponent {
  @Input() item!: MenuItem;
  @Input() isCollapsed = false;
  @Output() menuItemClick = new EventEmitter<void>();

  constructor(private sanitizer: DomSanitizer) {}

  get safeIcon(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.item.icon);
  }
}
