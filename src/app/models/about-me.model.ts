/**
 * Models for About Me component
 */

// Lane of the experience git graph: `main` = career path, `side` = work during studies
export type TimelineLane = 'main' | 'side';

// How a commit connects the side lane to the main lane
// - `merge`: side branch merges into this main-lane commit (enters from below)
// - `fork`:  side branch forks off right after this main-lane commit (leaves upward)
export type TimelineConnector = 'merge' | 'fork';

export interface Experience {
  readonly company: string;
  readonly badge: string;
  readonly period: string;
  readonly description: string;
  readonly logoUrl?: string; // Omitted -> neutral monochrome icon
  readonly icon?: string; // ng-icon name used when there is no logo
  readonly tech: readonly string[];
  readonly lane: TimelineLane;
  readonly connector?: TimelineConnector;
  readonly isPause?: boolean; // Dashed node (career break)
}

// Per-row segments of the graph, derived from the ordered experience list
export interface TimelineRow {
  readonly experience: Experience;
  readonly mainAbove: boolean;
  readonly mainBelow: boolean;
  readonly sideAbove: boolean;
  readonly sideBelow: boolean;
}

export interface CodeLine {
  readonly lineNumber: number;
  readonly parts: readonly CodeLinePart[];
}

export interface CodeLinePart {
  readonly text: string;
  readonly type: CodeSyntaxType;
}

export type CodeSyntaxType =
  | 'comment'
  | 'keyword'
  | 'variable'
  | 'string'
  | 'operator'
  | 'property'
  | 'default';

export interface StatCard {
  readonly value: string;
  readonly label: string;
  readonly color: string;
}

export interface ProfileInfo {
  readonly name: string;
  readonly title: string;
  readonly location: string;
  readonly avatarUrl: string;
  readonly linkedInUrl: string;
}
