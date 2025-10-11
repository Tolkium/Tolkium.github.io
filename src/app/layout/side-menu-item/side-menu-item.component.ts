import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuItem } from '../../models/menu-section';
import { NgIconComponent } from '@ng-icons/core';

@Component({
    selector: 'app-side-menu-item',
    standalone: true,
    imports: [RouterLink, NgIconComponent],
    templateUrl: './side-menu-item.component.html',
    styleUrls: ['./side-menu-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SideMenuItemComponent {
  @Input() item!: MenuItem;
  @Input() isCollapsed = false;
  @Output() menuItemClick = new EventEmitter<void>();
}
