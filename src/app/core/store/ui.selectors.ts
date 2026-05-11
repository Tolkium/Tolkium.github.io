import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UiState } from './ui.state';

export const selectUiState = createFeatureSelector<UiState>('ui');

export const selectIsDarkMode = createSelector(
  selectUiState,
  (state: UiState) => state.isDarkMode
);

export const selectIsMenuCollapsed = createSelector(
  selectUiState,
  (state: UiState) => state.isMenuCollapsed
);

export const selectIsMobile = createSelector(
  selectUiState,
  (state: UiState) => state.isMobile
);

export const selectHideScrollbar = createSelector(
  selectUiState,
  (state: UiState) => state.hideScrollbar
);

export const selectEnableSparkleEffect = createSelector(
  selectUiState,
  (state: UiState) => state.enableSparkleEffect
);

export const selectEnable3DTiltEffect = createSelector(
  selectUiState,
  (state: UiState) => state.enable3DTiltEffect
);

export const selectEnableHolographicEffect = createSelector(
  selectUiState,
  (state: UiState) => state.enableHolographicEffect
);

export const selectShowPerformanceMonitor = createSelector(
  selectUiState,
  (state: UiState) => state.showPerformanceMonitor
);

export const selectPerformanceMonitorThemeColor = createSelector(
  selectUiState,
  (state: UiState) => state.performanceMonitorThemeColor
);

export const selectEnableBackgroundAnimation = createSelector(
  selectUiState,
  (state: UiState) => state.enableBackgroundAnimation
);

// Particle physics selectors
export const selectEnableMagneticForce = createSelector(
  selectUiState,
  (state: UiState) => state.enableMagneticForce
);

export const selectEnableRepulsionForce = createSelector(
  selectUiState,
  (state: UiState) => state.enableRepulsionForce
);

export const selectEnableDamping = createSelector(
  selectUiState,
  (state: UiState) => state.enableDamping
);

export const selectEnableBrownianMotion = createSelector(
  selectUiState,
  (state: UiState) => state.enableBrownianMotion
);

// Animation configuration selectors
export const selectNumPoints = createSelector(selectUiState, (state: UiState) => state.numPoints);
export const selectConnectionRadius = createSelector(selectUiState, (state: UiState) => state.connectionRadius);
export const selectMagneticRadius = createSelector(selectUiState, (state: UiState) => state.magneticRadius);
export const selectMagneticStrength = createSelector(selectUiState, (state: UiState) => state.magneticStrength);
export const selectMinSpeed = createSelector(selectUiState, (state: UiState) => state.minSpeed);
export const selectMaxSpeed = createSelector(selectUiState, (state: UiState) => state.maxSpeed);
export const selectPointsSize = createSelector(selectUiState, (state: UiState) => state.pointsSize);
export const selectLineWidth = createSelector(selectUiState, (state: UiState) => state.lineWidth);
export const selectRepulsionRadius = createSelector(selectUiState, (state: UiState) => state.repulsionRadius);
export const selectRepulsionStrength = createSelector(selectUiState, (state: UiState) => state.repulsionStrength);
export const selectDampingFactor = createSelector(selectUiState, (state: UiState) => state.dampingFactor);
export const selectBrownianStrength = createSelector(selectUiState, (state: UiState) => state.brownianStrength);
export const selectEnablePolygonStabilizer = createSelector(selectUiState, (state: UiState) => state.enablePolygonStabilizer);
export const selectPolygonTargetSpacing = createSelector(selectUiState, (state: UiState) => state.polygonTargetSpacing);
export const selectPolygonStrength = createSelector(selectUiState, (state: UiState) => state.polygonStrength);
export const selectEnableCooldownAttraction = createSelector(selectUiState, (state: UiState) => state.enableCooldownAttraction);
export const selectCooldownMinDistance = createSelector(selectUiState, (state: UiState) => state.cooldownMinDistance);
export const selectCooldownResetDistance = createSelector(selectUiState, (state: UiState) => state.cooldownResetDistance);
export const selectCooldownDuration = createSelector(selectUiState, (state: UiState) => state.cooldownDuration);