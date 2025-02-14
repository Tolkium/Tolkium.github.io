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
  CONNECTION_RADIUS: 200,
  MAGNETIC_RADIUS: 100,
  MAGNETIC_STRENGTH: 0.0005,
  MIN_SPEED: 0.25,
  MAX_SPEED: 0.6,
  POINTS_SIZE: 5,
  LINE_WIDTH: 5,
  COLORS: {
    ORANGE: '#f29f67',
    PURPLE: '#8833cc'
  },
  GLOW: {
    POINTS_INTENSITY: 20,
    LINES_INTENSITY: 0
  }
};

export interface AnimationConfig extends Readonly<typeof ANIMATION_CONSTANTS> {
  showBorder: boolean;
  glowPoints: boolean;
  glowLines: boolean;
}
