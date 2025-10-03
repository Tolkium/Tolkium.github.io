import { Component } from '@angular/core';
import { DarkModeToggleComponent } from '../../layout/dark-mode-toggle/dark-mode-toggle.component';
import { CommonModule } from '@angular/common';
import { BackgroundAnimationComponent } from '../../shared/components/background-animation/background-animation.component';

@Component({
    selector: 'app-about-me',
    imports: [
        CommonModule,
        DarkModeToggleComponent,
        BackgroundAnimationComponent
    ],
    templateUrl: './about-me.component.html',
    styleUrls: ['./about-me.component.scss']
})
export class AboutMeComponent {
  title = 'About Me';

  softSkills = [
    'Problem Solving',
    'Fast Learner',
    'Agile',
    'Team Player',
    'Creativity',
    'Solution Design'
  ];

  technicalSkills = [
    'Angular',
    'JavaScript',
    'TypeScript',
    'HTML & SCSS',
    'Web Development',
    'Software Design Patterns',
    'SOLID Design Principles',
    'Bootstrap',
    'Git',
    'Azure DevOps',
    'Docker',
    'Nx',
    'Unit Testing',
    'RXJS',
    'NodeJS',
    'NestJS',
    'OpenAI API',
    'Python',
    'And More...'
  ];

  public goToLinkedIn(): void {
    window.open('https://www.linkedin.com/in/marek-sipos/', '_blank');
  }
}
