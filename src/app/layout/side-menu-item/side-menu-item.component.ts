import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from '../../models/menu-section';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroCalendar,
  heroCog6Tooth,
  heroClipboardDocumentList,
  heroChartBarSquare,
  heroSquares2x2,
  heroPuzzlePiece,
  heroFolderOpen,
  heroPhoto,
  heroUserGroup,
  heroCpuChip,
  heroCommandLine,
  heroBeaker,
  heroSwatch,
  heroCodeBracket,
  heroArchiveBox,
  heroServer,
  heroSparkles,
  heroPresentationChartBar,
  heroDocumentText,
  heroCube,
  heroChartPie,
  heroArrowDownTray,
  heroAdjustmentsHorizontal,
} from '@ng-icons/heroicons/outline';

@Component({
    selector: 'app-side-menu-item',
    standalone: true,
    imports: [CommonModule, RouterModule, NgIcon],
    templateUrl: './side-menu-item.component.html',
    styleUrls: ['./side-menu-item.component.scss'],
    providers: [
      provideIcons({
        heroCalendar,
        heroCog6Tooth,
        heroClipboardDocumentList,
        heroChartBarSquare,
        heroSquares2x2,
        heroPuzzlePiece,
        heroFolderOpen,
        heroPhoto,
        heroUserGroup,
        heroCpuChip,
        heroCommandLine,
        heroBeaker,
        heroSwatch,
        heroCodeBracket,
        heroArchiveBox,
        heroServer,
        heroSparkles,
        heroPresentationChartBar,
        heroDocumentText,
        heroCube,
        heroChartPie,
        heroArrowDownTray,
        heroAdjustmentsHorizontal,
      })
    ]
})
export class SideMenuItemComponent {
  @Input() item!: MenuItem;
  @Input() isCollapsed = false;
  @Output() menuItemClick = new EventEmitter<void>();

  constructor(private sanitizer: DomSanitizer) {}

  get safeIcon(): SafeHtml {
    const svg = this.item.icon ?? '';
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }
}
