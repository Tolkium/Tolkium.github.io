import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TECHNICAL_SKILLS, SOFT_SKILLS } from '../../models/skills.model';

@Component({
    selector: 'app-about-me',
    imports: [],
    templateUrl: './about-me.component.html',
    styleUrls: ['./about-me.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutMeComponent {
  title = 'About Me';

  // Skills are sourced from centralized skills.model.ts
  softSkills = SOFT_SKILLS;
  technicalSkills = [...TECHNICAL_SKILLS, 'And More...'];

  public goToLinkedIn(): void {
    window.open('https://www.linkedin.com/in/marek-sipos/', '_blank');
  }
}
