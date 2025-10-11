import { Component, Input, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Project } from '../../../models/project.model';
import { selectEnableSparkleEffect, selectEnable3DTiltEffect, selectEnableHolographicEffect } from '../../../core/store/ui.selectors';
import { Card3DTiltDirective } from './directives/card-3d-tilt.directive';
import { CardHolographicDirective } from './directives/card-holographic.directive';
import { CardSparkleDirective } from './directives/card-sparkle.directive';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [
    CommonModule,
    Card3DTiltDirective,
    CardHolographicDirective,
    CardSparkleDirective
  ],
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectCardComponent {
  @Input() project!: Project;
  private readonly store = inject(Store);
  readonly enableSparkleEffect$ = this.store.select(selectEnableSparkleEffect);
  readonly enable3DTiltEffect$ = this.store.select(selectEnable3DTiltEffect);
  readonly enableHolographicEffect$ = this.store.select(selectEnableHolographicEffect);

  get difficultyStars(): number[] {
    return Array(5).fill(0).map((_, i) => i);
  }

  get statusColor(): string {
    switch (this.project.status) {
      case 'completed':
        return 'status-completed';
      case 'in-progress':
        return 'status-progress';
      case 'planned':
        return 'status-planned';
      default:
        return '';
    }
  }

  get statusLabel(): string {
    switch (this.project.status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'planned':
        return 'Planned';
      default:
        return '';
    }
  }
}

