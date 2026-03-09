import { createReducer, on } from '@ngrx/store';
import { initialUiState } from './ui.state';
import * as UiActions from './ui.actions';

export const uiReducer = createReducer(
  initialUiState,
  on(UiActions.toggleDarkMode, state => ({
    ...state,
    isDarkMode: !state.isDarkMode
  })),
  on(UiActions.setDarkMode, (state, { isDarkMode }) => ({
    ...state,
    isDarkMode
  })),
  on(UiActions.toggleMenuCollapse, state => ({
    ...state,
    isMenuCollapsed: !state.isMenuCollapsed
  })),
  on(UiActions.setMenuCollapse, (state, { isCollapsed }) => ({
    ...state,
    isMenuCollapsed: isCollapsed
  })),
  on(UiActions.setMobileState, (state, { isMobile }) => ({
    ...state,
    isMobile
  })),
  on(UiActions.toggleHideScrollbar, state => ({
    ...state,
    hideScrollbar: !state.hideScrollbar
  })),
  on(UiActions.setHideScrollbar, (state, { hideScrollbar }) => ({
    ...state,
    hideScrollbar
  })),
  on(UiActions.toggleSparkleEffect, state => ({
    ...state,
    enableSparkleEffect: !state.enableSparkleEffect
  })),
  on(UiActions.setSparkleEffect, (state, { enableSparkleEffect }) => ({
    ...state,
    enableSparkleEffect
  })),
  on(UiActions.toggle3DTiltEffect, state => ({
    ...state,
    enable3DTiltEffect: !state.enable3DTiltEffect
  })),
  on(UiActions.set3DTiltEffect, (state, { enable3DTiltEffect }) => ({
    ...state,
    enable3DTiltEffect
  })),
  on(UiActions.toggleHolographicEffect, state => ({
    ...state,
    enableHolographicEffect: !state.enableHolographicEffect
  })),
  on(UiActions.setHolographicEffect, (state, { enableHolographicEffect }) => ({
    ...state,
    enableHolographicEffect
  })),
  on(UiActions.togglePerformanceMonitor, state => ({
    ...state,
    showPerformanceMonitor: !state.showPerformanceMonitor
  })),
  on(UiActions.setPerformanceMonitor, (state, { showPerformanceMonitor }) => ({
    ...state,
    showPerformanceMonitor
  })),
  on(UiActions.setPerformanceMonitorThemeColor, (state, { themeColor }) => ({
    ...state,
    performanceMonitorThemeColor: themeColor
  })),
  on(UiActions.toggleBackgroundAnimation, state => ({
    ...state,
    enableBackgroundAnimation: !state.enableBackgroundAnimation
  })),
  on(UiActions.setBackgroundAnimation, (state, { enableBackgroundAnimation }) => ({
    ...state,
    enableBackgroundAnimation
  })),
  on(UiActions.toggleMagneticForce, state => ({
    ...state,
    enableMagneticForce: !state.enableMagneticForce
  })),
  on(UiActions.setMagneticForce, (state, { enableMagneticForce }) => ({
    ...state,
    enableMagneticForce
  })),
  on(UiActions.toggleRepulsionForce, state => ({
    ...state,
    enableRepulsionForce: !state.enableRepulsionForce
  })),
  on(UiActions.setRepulsionForce, (state, { enableRepulsionForce }) => ({
    ...state,
    enableRepulsionForce
  })),
  on(UiActions.toggleDamping, state => ({
    ...state,
    enableDamping: !state.enableDamping
  })),
  on(UiActions.setDamping, (state, { enableDamping }) => ({
    ...state,
    enableDamping
  })),
  on(UiActions.toggleBrownianMotion, state => ({
    ...state,
    enableBrownianMotion: !state.enableBrownianMotion
  })),
  on(UiActions.setBrownianMotion, (state, { enableBrownianMotion }) => ({
    ...state,
    enableBrownianMotion
  })),
  on(UiActions.toggleClusterBreaking, state => ({
    ...state,
    enableClusterBreaking: !state.enableClusterBreaking
  })),
  on(UiActions.setClusterBreaking, (state, { enableClusterBreaking }) => ({
    ...state,
    enableClusterBreaking
  })),
  on(UiActions.setNumPoints, (state, { value }) => ({ ...state, numPoints: value })),
  on(UiActions.setConnectionRadius, (state, { value }) => ({ ...state, connectionRadius: value })),
  on(UiActions.setMagneticRadius, (state, { value }) => ({ ...state, magneticRadius: value })),
  on(UiActions.setMagneticStrengthValue, (state, { value }) => ({ ...state, magneticStrength: value })),
  on(UiActions.setMinSpeed, (state, { value }) => ({ ...state, minSpeed: value })),
  on(UiActions.setMaxSpeed, (state, { value }) => ({ ...state, maxSpeed: value })),
  on(UiActions.setPointsSize, (state, { value }) => ({ ...state, pointsSize: value })),
  on(UiActions.setLineWidth, (state, { value }) => ({ ...state, lineWidth: value })),
  on(UiActions.setRepulsionRadiusValue, (state, { value }) => ({ ...state, repulsionRadius: value })),
  on(UiActions.setRepulsionStrengthValue, (state, { value }) => ({ ...state, repulsionStrength: value })),
  on(UiActions.setDampingFactorValue, (state, { value }) => ({ ...state, dampingFactor: value })),
  on(UiActions.setBrownianStrengthValue, (state, { value }) => ({ ...state, brownianStrength: value })),
  on(UiActions.setClusterThresholdValue, (state, { value }) => ({ ...state, clusterThreshold: value })),
  on(UiActions.setExplosionForceValue, (state, { value }) => ({ ...state, explosionForce: value })),
  on(UiActions.setClusterCheckIntervalValue, (state, { value }) => ({ ...state, clusterCheckInterval: value })),
  on(UiActions.setMinClusterSizeValue, (state, { value }) => ({ ...state, minClusterSize: value })),
  on(UiActions.setMagneticMode, (state, { mode }) => ({ ...state, magneticMode: mode })),
  on(UiActions.setMagneticMinStrengthValue, (state, { value }) => ({ ...state, magneticMinStrength: value })),
  on(UiActions.setMagneticMaxStrengthValue, (state, { value }) => ({ ...state, magneticMaxStrength: value })),
  on(UiActions.setMagneticInverseCoefficientValue, (state, { value }) => ({ ...state, magneticInverseCoefficient: value })),
  on(UiActions.setMagneticFluctuationSpeedValue, (state, { value }) => ({ ...state, magneticFluctuationSpeed: value })),
  on(UiActions.togglePolygonStabilizer, state => ({
    ...state,
    enablePolygonStabilizer: !state.enablePolygonStabilizer
  })),
  on(UiActions.setPolygonStabilizer, (state, { enablePolygonStabilizer }) => ({
    ...state,
    enablePolygonStabilizer
  })),
  on(UiActions.setPolygonTargetSpacingValue, (state, { value }) => ({ ...state, polygonTargetSpacing: value })),
  on(UiActions.setPolygonStrengthValue, (state, { value }) => ({ ...state, polygonStrength: value })),
  on(UiActions.resetAnimationSettings, state => ({
    ...state,
    numPoints: 100,
    connectionRadius: 200,
    magneticRadius: 100,
    magneticStrength: 0.0005,
    minSpeed: 0.25,
    maxSpeed: 0.6,
    pointsSize: 5,
    lineWidth: 5,
    repulsionRadius: 30,
    repulsionStrength: 1.2,
    dampingFactor: 0.95,
    brownianStrength: 0.02,
    clusterThreshold: 20,
    explosionForce: 300,
    clusterCheckInterval: 180,
    minClusterSize: 8,
    // Do not force magneticMode here; keep current choice
    magneticMinStrength: 0.0001,
    magneticMaxStrength: 0.003,
    magneticInverseCoefficient: 1.0,
    magneticFluctuationSpeed: 7.5,
    enablePolygonStabilizer: true,
    polygonTargetSpacing: 120,
    polygonStrength: 0.0008
  }))
);
