import { Component, Input, ElementRef, HostListener } from '@angular/core';
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

  constructor(private elementRef: ElementRef) {}

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

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    const card = this.elementRef.nativeElement;
    const rect = card.getBoundingClientRect();
    
    // Calculate mouse position relative to card center (0 to 1)
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    
    // Calculate rotation angles (max ±15 degrees)
    const rotateY = (x - 0.5) * 30; // Horizontal tilt
    const rotateX = (0.5 - y) * 30; // Vertical tilt (inverted)
    
    // Calculate shine position (0-100%)
    const shineX = x * 100;
    const shineY = y * 100;
    
    // Apply CSS variables
    card.style.setProperty('--rotate-x', `${rotateX}deg`);
    card.style.setProperty('--rotate-y', `${rotateY}deg`);
    card.style.setProperty('--shine-x', `${shineX}%`);
    card.style.setProperty('--shine-y', `${shineY}%`);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    const card = this.elementRef.nativeElement;
    
    // Reset all transforms
    card.style.setProperty('--rotate-x', '0deg');
    card.style.setProperty('--rotate-y', '0deg');
    card.style.setProperty('--shine-x', '50%');
    card.style.setProperty('--shine-y', '50%');
  }
}

