// interfaces/animation.types.ts
export interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  connections: number;
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export const ANIMATION_CONSTANTS = {
  NUM_POINTS: 100,
  CONNECTION_RADIUS: 250,
  MAGNETIC_RADIUS: 100,
  MAGNETIC_STRENGTH: 0.0005,
  MIN_SPEED: 0.15,
  MAX_SPEED: 0.6,
  POINTS_SIZE: 7,
  LINE_WIDTH: 7,
  COLORS: {
    BLUE: '#0066cc',
    PURPLE: '#8833cc'
  },
  GLOW: {
    POINTS_INTENSITY: 5,
    LINES_INTENSITY: 10
  }
} as const;

export interface AnimationConfig {
  showBorder: boolean;
  glowPoints: boolean;
  glowLines: boolean;
  NUM_POINTS: typeof ANIMATION_CONSTANTS.NUM_POINTS;
  CONNECTION_RADIUS: typeof ANIMATION_CONSTANTS.CONNECTION_RADIUS;
  MAGNETIC_RADIUS: typeof ANIMATION_CONSTANTS.MAGNETIC_RADIUS;
  MAGNETIC_STRENGTH: typeof ANIMATION_CONSTANTS.MAGNETIC_STRENGTH;
  MIN_SPEED: typeof ANIMATION_CONSTANTS.MIN_SPEED;
  MAX_SPEED: typeof ANIMATION_CONSTANTS.MAX_SPEED;
  POINTS_SIZE: typeof ANIMATION_CONSTANTS.POINTS_SIZE;
  LINE_WIDTH: typeof ANIMATION_CONSTANTS.LINE_WIDTH;
  COLORS: typeof ANIMATION_CONSTANTS.COLORS;
  GLOW: typeof ANIMATION_CONSTANTS.GLOW;
}
