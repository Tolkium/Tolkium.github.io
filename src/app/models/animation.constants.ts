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
  },
  // Physics constants for particle behavior
  REPULSION_RADIUS: 30,
  REPULSION_STRENGTH: 1.2,
  DAMPING_FACTOR: 0.95,
  BROWNIAN_STRENGTH: 0.02, // Reduced for subtle jittering without canceling motion
  CLUSTER_THRESHOLD: 20, // Distance to consider particles clustered
  EXPLOSION_FORCE: 300, // Powerful explosion force for dramatic dispersion
  CLUSTER_CHECK_INTERVAL: 180, // Check every 3 seconds (give time to form clusters)
  MIN_CLUSTER_SIZE: 8 // Wait for more particles before breaking (let clusters form)
};

export interface AnimationConfig extends Readonly<typeof ANIMATION_CONSTANTS> {
  showBorder: boolean;
  glowPoints: boolean;
  glowLines: boolean;
}
