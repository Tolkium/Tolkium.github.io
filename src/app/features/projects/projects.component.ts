import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectCardComponent } from './project-card/project-card.component';
import { BackgroundAnimationComponent } from '../../shared/components/background-animation/background-animation.component';
import { DarkModeToggleComponent } from '../../layout/dark-mode-toggle/dark-mode-toggle.component';
import { MOCK_PROJECTS } from '../../models/project.model';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, ProjectCardComponent, BackgroundAnimationComponent, DarkModeToggleComponent],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent {
  projects = MOCK_PROJECTS;
}

