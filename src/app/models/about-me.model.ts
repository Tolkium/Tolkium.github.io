/**
 * Models for About Me component
 */

// Branch position enum for multi-branch graph
export type BranchPosition = 'main' | 'feature' | 'merge';

// Branch line style
export type BranchLineStyle = 'solid' | 'dashed' | 'none';

// Experience with branch information for GitLens-style graph
export interface Experience {
  readonly company: string;
  readonly role: string;
  readonly period: string;
  readonly description: string;
  readonly icon: string;
  readonly color: string;
  readonly tech?: readonly string[];
  // Branch visualization properties
  readonly branch?: BranchPosition;
  readonly lineStyle?: BranchLineStyle;
  readonly isMerge?: boolean;
  readonly isBranchStart?: boolean;
  readonly isBranchEnd?: boolean;
}

// Branch color configuration
export interface BranchColors {
  readonly main: BranchColorPair;
  readonly feature: BranchColorPair;
  readonly merge: BranchColorPair;
}

export interface BranchColorPair {
  readonly light: string;
  readonly dark: string;
  readonly bgLight: string;
  readonly bgDark: string;
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
