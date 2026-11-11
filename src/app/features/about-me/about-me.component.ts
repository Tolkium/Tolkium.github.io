import { Component, ChangeDetectionStrategy, computed } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroAcademicCap, heroCpuChip, heroPauseCircle } from '@ng-icons/heroicons/outline';
import { TECHNICAL_SKILLS, SOFT_SKILLS } from '../../models/skills.model';
import type { BranchLane, Experience, CodeLine, StatCard, TimelineGraph, TimelineSegment } from '../../models/about-me.model';
import { PROFILE_INFO, STAT_CARDS, CODE_LINES, EDUCATION, EXPERIENCES } from './about-me.data';

@Component({
  selector: 'app-about-me',
  imports: [NgIconComponent],
  templateUrl: './about-me.component.html',
  styleUrls: ['./about-me.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ heroAcademicCap, heroCpuChip, heroPauseCircle })],
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
 * Derives the graph from the ordered (newest-first) list.
 * `main` runs from HEAD down to "Initial commit"; its last stretch is dotted.
 * Every branch lane forks off "Initial commit" and runs up to the row that merges it.
 */
export function buildTimeline(experiences: readonly Experience[]): TimelineGraph {
  const branches: readonly BranchLane[] = ['school', 'side'];
  const mergeRow = new Map(branches.map((lane) => [lane, experiences.findIndex((e) => e.mergeFrom === lane)]));
  const last = experiences.length - 1;

  const rows = experiences.map((experience, i) => {
    const segments: TimelineSegment[] = [];
    if (i > 0) segments.push({ lane: 'main', part: 'above' });
    segments.push({ lane: 'main', part: 'below', dotted: i === last });
    for (const lane of branches) {
      const m = mergeRow.get(lane)!;
      if (i > m) segments.push({ lane, part: 'above' }, { lane, part: 'below' });
      else if (i === m) segments.push({ lane, part: 'below', fromMerge: true });
    }
    return { experience, segments, merges: branches.filter((lane) => mergeRow.get(lane) === i) };
  });

  return {
    rows,
    initial: {
      segments: [
        { lane: 'main', part: 'above', dotted: true },
        ...branches.map((lane): TimelineSegment => ({ lane, part: 'above', toFork: true })),
      ],
      forks: branches,
    },
  };
}
