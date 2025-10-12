import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-about-me',
    imports: [],
    templateUrl: './about-me.component.html',
    styleUrls: ['./about-me.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
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
