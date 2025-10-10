import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from '../../../models/project.model';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss']
})
export class ProjectCardComponent {
  @Input() project!: Project;

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

