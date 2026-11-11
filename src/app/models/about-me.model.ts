/**
 * Models for About Me component
 */

// Lanes of the experience git graph (left -> right).
// Every lane starts at "Initial commit"; branch lanes end where they merge into `main`.
export type TimelineLane = 'main' | 'school' | 'side';
export type BranchLane = Exclude<TimelineLane, 'main'>;

export interface Experience {
  readonly company: string;
  readonly badge: string;
  readonly period: string;
  readonly description: string;
  readonly logoUrl?: string; // Omitted -> neutral monochrome icon
  readonly icon?: string; // ng-icon name used when there is no logo
  readonly tech?: readonly string[];
  readonly lane: TimelineLane; // lane the commit node sits on
  readonly mergeFrom?: BranchLane; // this main-lane commit merges (and ends) that branch
  readonly tone?: TimelineLane; // badge color, defaults to `lane`
  readonly isPause?: boolean; // Dashed node (career break)
}

export interface TimelineSegment {
  readonly lane: TimelineLane;
  readonly part: 'above' | 'below'; // above / below the row's node
  readonly fromMerge?: boolean; // starts below the merge curve
  readonly toFork?: boolean; // ends above the fork curve (initial commit)
  readonly dotted?: boolean;
}

// Graph pieces for one row, derived from the ordered experience list
export interface TimelineRow {
  readonly experience: Experience;
  readonly segments: readonly TimelineSegment[];
  readonly merges: readonly BranchLane[];
}

export interface TimelineGraph {
  readonly rows: readonly TimelineRow[];
  readonly initial: { readonly segments: readonly TimelineSegment[]; readonly forks: readonly BranchLane[] };
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
