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

// One row of the graph, drawn as a single SVG in CSS-pixel units.
// y values are numbers (px) or '100%' (row bottom).
export interface GraphLine {
  readonly lane: TimelineLane;
  readonly x: number;
  readonly y1: number | string;
  readonly y2: number | string;
  readonly dotted?: boolean;
}

export interface GraphCurve {
  readonly lane: TimelineLane;
  readonly d: string;
}

export interface GraphNode {
  readonly lane: TimelineLane;
  readonly x: number;
  readonly y: number;
  readonly kind?: 'pause' | 'initial';
}

export interface RowGraph {
  readonly lines: readonly GraphLine[];
  readonly curves: readonly GraphCurve[];
  readonly node: GraphNode;
}

export interface TimelineRow {
  readonly experience: Experience;
  readonly graph: RowGraph;
}

export interface TimelineGraph {
  readonly rows: readonly TimelineRow[];
  readonly initial: RowGraph;
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
