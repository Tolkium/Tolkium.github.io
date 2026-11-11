import { Component, ChangeDetectionStrategy, computed } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroAcademicCap, heroCpuChip, heroPauseCircle } from '@ng-icons/heroicons/outline';
import { TECHNICAL_SKILLS, SOFT_SKILLS } from '../../models/skills.model';
import type { BranchLane, Experience, CodeLine, GraphCurve, GraphLine, StatCard, TimelineGraph, TimelineLane } from '../../models/about-me.model';
import { PROFILE_INFO, STAT_CARDS, CODE_LINES, EDUCATION, EXPERIENCES } from './about-me.data';

@Component({
  selector: 'app-about-me',
  imports: [NgIconComponent, NgTemplateOutlet],
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

// Graph geometry in CSS px. Lane centers sit on .5 so 3px strokes are pixel-aligned.
export const GRAPH = {
  laneX: { main: 10.5, school: 24.5, side: 38.5 } satisfies Record<TimelineLane, number>,
  nodeY: 22, // vertical center of the title line
  initialNodeY: 38, // lower, so every branch can fork off "Initial commit"
} as const;

/**
 * Derives the graph from the ordered (newest-first) list.
 * `main` runs from HEAD down to "Initial commit"; its last stretch is dotted.
 * Every branch lane forks off "Initial commit" and runs up to the row that merges it.
 * Each row is one SVG, so lines, curves and nodes share one coordinate system.
 */
export function buildTimeline(experiences: readonly Experience[]): TimelineGraph {
  const { laneX, nodeY, initialNodeY } = GRAPH;
  const mainX = laneX.main;
  const branches: readonly BranchLane[] = ['school', 'side'];
  const mergeRow = new Map(branches.map((lane) => [lane, experiences.findIndex((e) => e.mergeFrom === lane)]));
  const last = experiences.length - 1;
  const bottom = '100%';

  const rows = experiences.map((experience, i) => {
    const lines: GraphLine[] = [];
    const curves: GraphCurve[] = [];

    if (i === last) {
      lines.push({ lane: 'main', x: mainX, y1: 0, y2: nodeY });
      lines.push({ lane: 'main', x: mainX, y1: nodeY, y2: bottom, dotted: true });
    } else {
      lines.push({ lane: 'main', x: mainX, y1: i === 0 ? nodeY : 0, y2: bottom });
    }

    for (const lane of branches) {
      const x = laneX[lane];
      const m = mergeRow.get(lane)!;
      if (i > m) {
        lines.push({ lane, x, y1: 0, y2: bottom });
      } else if (i === m) {
        const dx = x - mainX;
        lines.push({ lane, x, y1: nodeY + dx, y2: bottom });
        curves.push({ lane, d: `M${x} ${nodeY + dx} Q${x} ${nodeY} ${mainX} ${nodeY}` });
      }
    }

    return {
      experience,
      graph: {
        lines,
        curves,
        node: { lane: experience.lane, x: laneX[experience.lane], y: nodeY, kind: experience.isPause ? 'pause' : undefined },
      },
    } as const;
  });

  return {
    rows,
    initial: {
      lines: [
        { lane: 'main', x: mainX, y1: 0, y2: initialNodeY, dotted: true },
        ...branches.map((lane): GraphLine => ({ lane, x: laneX[lane], y1: 0, y2: initialNodeY - (laneX[lane] - mainX) })),
      ],
      curves: branches.map((lane): GraphCurve => {
        const x = laneX[lane];
        return { lane, d: `M${mainX} ${initialNodeY} Q${x} ${initialNodeY} ${x} ${initialNodeY - (x - mainX)}` };
      }),
      node: { lane: 'main', x: mainX, y: initialNodeY, kind: 'initial' },
    },
  };
}
