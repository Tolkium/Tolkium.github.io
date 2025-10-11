import { Component, Input, ElementRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Project } from '../../../models/project.model';
import { selectEnableSparkleEffect } from '../../../core/store/ui.selectors';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss']
})
export class ProjectCardComponent {
  @Input() project!: Project;
  isActive = false;
  private readonly store = inject(Store);
  enableSparkleEffect$ = this.store.select(selectEnableSparkleEffect);

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
    const card = this.elementRef.nativeElement.querySelector('.card-inner') as HTMLElement;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    
    // Get mouse position relative to card
    const l = event.clientX - rect.left;
    const t = event.clientY - rect.top;
    const h = rect.height;
    const w = rect.width;
    
    // Calculate percentages (Pokemon card style)
    const px = Math.abs(Math.floor(100 / w * l) - 100);
    const py = Math.abs(Math.floor(100 / h * t) - 100);
    const pa = (50 - px) + (50 - py);
    
    // Calculate gradient/background positions
    const lp = 50 + (px - 50) / 1.5;
    const tp = 50 + (py - 50) / 1.5;
    
    // Sparkle follows cursor with slight damping for smooth, stretched movement
    const px_spark = 50 + ((l / w) * 100 - 50) / 1.5;
    const py_spark = 50 + ((t / h) * 100 - 50) / 1.5;
    
    const p_opc = 20 + Math.abs(pa) * 1.5;
    
    // Calculate transforms
    const ty = ((tp - 50) / 2) * -1;
    const tx = ((lp - 50) / 1.5) * 0.5;
    
    // Apply CSS variables
    card.style.setProperty('--rotate-x', `${ty}deg`);
    card.style.setProperty('--rotate-y', `${tx}deg`);
    card.style.setProperty('--grad-pos-x', `${lp}%`);
    card.style.setProperty('--grad-pos-y', `${tp}%`);
    card.style.setProperty('--spark-pos-x', `${px_spark}%`);
    card.style.setProperty('--spark-pos-y', `${py_spark}%`);
    card.style.setProperty('--sparkle-opacity', `${p_opc / 100}`);
    
    this.isActive = true;
    card.classList.add('active');
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    const card = this.elementRef.nativeElement.querySelector('.card-inner') as HTMLElement;
    if (!card) return;
    
    // Reset all transforms and effects to initial state
    card.style.setProperty('--rotate-x', '0deg');
    card.style.setProperty('--rotate-y', '0deg');
    card.style.setProperty('--grad-pos-x', '50%');
    card.style.setProperty('--grad-pos-y', '50%');
    card.style.setProperty('--spark-pos-x', '50%');
    card.style.setProperty('--spark-pos-y', '50%');
    card.style.setProperty('--sparkle-opacity', '0.4');
    
    this.isActive = false;
    card.classList.remove('active');
  }
}

