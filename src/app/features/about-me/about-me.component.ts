import { Component, ChangeDetectionStrategy, computed } from '@angular/core';
import { TECHNICAL_SKILLS, SOFT_SKILLS } from '../../models/skills.model';
import type { Experience, CodeLine, StatCard } from '../../models/about-me.model';
import { PROFILE_INFO, STAT_CARDS, CODE_LINES, EDUCATION, EXPERIENCES } from './about-me.data';

@Component({
  selector: 'app-about-me',
  imports: [],
  templateUrl: './about-me.component.html',
  styleUrls: ['./about-me.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutMeComponent {
  // Immutable data
  readonly profile = PROFILE_INFO;
  readonly statCards = STAT_CARDS;
  readonly codeLines = CODE_LINES;
  readonly education = EDUCATION;
  readonly experiences = EXPERIENCES;

  // Computed signals
  readonly technicalSkills = computed(() => [...TECHNICAL_SKILLS, 'And More...']);
  readonly softSkills = computed(() => SOFT_SKILLS);

  // TrackBy functions for performance
  public trackByCompany(_index: number, experience: Experience): string {
    return experience.company;
  }

  public trackByLineNumber(_index: number, line: CodeLine): number {
    return line.lineNumber;
  }

  public trackByStatLabel(_index: number, stat: StatCard): string {
    return stat.label;
  }

  public trackByTech(_index: number, tech: string): string {
    return tech;
  }

  public trackBySkill(_index: number, skill: string): string {
    return skill;
  }

  public trackByPartText(_index: number, part: { text: string; type: string }): string {
    return part.text;
  }

  // Methods
  public goToLinkedIn(): void {
    window.open(this.profile.linkedInUrl, '_blank', 'noopener,noreferrer');
  }

}
