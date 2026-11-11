import { Component, ChangeDetectionStrategy, computed } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroCpuChip, heroPauseCircle } from '@ng-icons/heroicons/outline';
import { TECHNICAL_SKILLS, SOFT_SKILLS } from '../../models/skills.model';
import type { Experience, CodeLine, StatCard, TimelineRow } from '../../models/about-me.model';
import { PROFILE_INFO, STAT_CARDS, CODE_LINES, EDUCATION, EXPERIENCES } from './about-me.data';

@Component({
  selector: 'app-about-me',
  imports: [NgIconComponent],
  templateUrl: './about-me.component.html',
  styleUrls: ['./about-me.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ heroCpuChip, heroPauseCircle })],
})
export class AboutMeComponent {
  // Immutable data
  readonly profile = PROFILE_INFO;
  readonly statCards = STAT_CARDS;
  readonly codeLines = CODE_LINES;
  readonly education = EDUCATION;
  readonly timeline = buildTimeline(EXPERIENCES);

  // Computed signals
  readonly technicalSkills = computed(() => [...TECHNICAL_SKILLS, 'And More...']);
  readonly softSkills = computed(() => SOFT_SKILLS);

  // TrackBy functions for performance
  public trackByLineNumber(_index: number, line: CodeLine): number {
    return line.lineNumber;
  }

  public trackByStatLabel(_index: number, stat: StatCard): string {
    return stat.label;
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

/**
 * Derives which graph segments each row draws from the ordered (newest-first) list.
 * The side lane is open between a `merge` commit (top) and a `fork` commit (bottom).
 */
export function buildTimeline(experiences: readonly Experience[]): readonly TimelineRow[] {
  let sideOpen = false;
  return experiences.map((experience, index) => {
    const sideAbove = sideOpen && experience.connector !== 'merge';
    if (experience.connector === 'merge') sideOpen = true;
    if (experience.connector === 'fork') sideOpen = false;
    return {
      experience,
      mainAbove: index > 0,
      mainBelow: true, // continues down to the "Initial commit" row
      sideAbove,
      sideBelow: sideOpen,
    };
  });
}
