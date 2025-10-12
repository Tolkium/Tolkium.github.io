import { createAction, props } from '@ngrx/store';

export const toggleDarkMode = createAction('[UI] Toggle Dark Mode');
export const setDarkMode = createAction(
  '[UI] Set Dark Mode',
  props<{ isDarkMode: boolean }>()
);

export const toggleMenuCollapse = createAction('[UI] Toggle Menu Collapse');
export const setMenuCollapse = createAction(
  '[UI] Set Menu Collapse',
  props<{ isCollapsed: boolean }>()
);

export const setMobileState = createAction(
  '[UI] Set Mobile State',
  props<{ isMobile: boolean }>()
);

export const toggleHideScrollbar = createAction('[UI] Toggle Hide Scrollbar');
export const setHideScrollbar = createAction(
  '[UI] Set Hide Scrollbar',
  props<{ hideScrollbar: boolean }>()
);

export const toggleSparkleEffect = createAction('[UI] Toggle Sparkle Effect');
export const setSparkleEffect = createAction(
  '[UI] Set Sparkle Effect',
  props<{ enableSparkleEffect: boolean }>()
);

export const toggle3DTiltEffect = createAction('[UI] Toggle 3D Tilt Effect');
export const set3DTiltEffect = createAction(
  '[UI] Set 3D Tilt Effect',
  props<{ enable3DTiltEffect: boolean }>()
);

export const toggleHolographicEffect = createAction('[UI] Toggle Holographic Effect');
export const setHolographicEffect = createAction(
  '[UI] Set Holographic Effect',
  props<{ enableHolographicEffect: boolean }>()
);

export const togglePerformanceMonitor = createAction('[UI] Toggle Performance Monitor');
export const setPerformanceMonitor = createAction(
  '[UI] Set Performance Monitor',
  props<{ showPerformanceMonitor: boolean }>()
);

export const setPerformanceMonitorThemeColor = createAction(
  '[UI] Set Performance Monitor Theme Color',
  props<{ themeColor: string }>()
);

export const toggleBackgroundAnimation = createAction('[UI] Toggle Background Animation');
export const setBackgroundAnimation = createAction(
  '[UI] Set Background Animation',
  props<{ enableBackgroundAnimation: boolean }>()
);

// Particle physics actions
export const toggleMagneticForce = createAction('[UI] Toggle Magnetic Force');
export const setMagneticForce = createAction(
  '[UI] Set Magnetic Force',
  props<{ enableMagneticForce: boolean }>()
);

export const toggleRepulsionForce = createAction('[UI] Toggle Repulsion Force');
export const setRepulsionForce = createAction(
  '[UI] Set Repulsion Force',
  props<{ enableRepulsionForce: boolean }>()
);

export const toggleDamping = createAction('[UI] Toggle Damping');
export const setDamping = createAction(
  '[UI] Set Damping',
  props<{ enableDamping: boolean }>()
);

export const toggleBrownianMotion = createAction('[UI] Toggle Brownian Motion');
export const setBrownianMotion = createAction(
  '[UI] Set Brownian Motion',
  props<{ enableBrownianMotion: boolean }>()
);

export const toggleClusterBreaking = createAction('[UI] Toggle Cluster Breaking');
export const setClusterBreaking = createAction(
  '[UI] Set Cluster Breaking',
  props<{ enableClusterBreaking: boolean }>()
);

// Animation configuration actions (numeric values)
export const setNumPoints = createAction('[UI] Set Number of Points', props<{ value: number }>());
export const setConnectionRadius = createAction('[UI] Set Connection Radius', props<{ value: number }>());
export const setMagneticRadius = createAction('[UI] Set Magnetic Radius', props<{ value: number }>());
export const setMagneticStrengthValue = createAction('[UI] Set Magnetic Strength', props<{ value: number }>());
export const setMinSpeed = createAction('[UI] Set Min Speed', props<{ value: number }>());
export const setMaxSpeed = createAction('[UI] Set Max Speed', props<{ value: number }>());
export const setPointsSize = createAction('[UI] Set Points Size', props<{ value: number }>());
export const setLineWidth = createAction('[UI] Set Line Width', props<{ value: number }>());
export const setRepulsionRadiusValue = createAction('[UI] Set Repulsion Radius', props<{ value: number }>());
export const setRepulsionStrengthValue = createAction('[UI] Set Repulsion Strength', props<{ value: number }>());
export const setDampingFactorValue = createAction('[UI] Set Damping Factor', props<{ value: number }>());
export const setBrownianStrengthValue = createAction('[UI] Set Brownian Strength', props<{ value: number }>());
export const setClusterThresholdValue = createAction('[UI] Set Cluster Threshold', props<{ value: number }>());
export const setExplosionForceValue = createAction('[UI] Set Explosion Force', props<{ value: number }>());
export const setClusterCheckIntervalValue = createAction('[UI] Set Cluster Check Interval', props<{ value: number }>());
export const setMinClusterSizeValue = createAction('[UI] Set Min Cluster Size', props<{ value: number }>());

// Reset all animation settings to defaults
export const resetAnimationSettings = createAction('[UI] Reset Animation Settings');