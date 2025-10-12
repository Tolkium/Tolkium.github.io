import { createReducer, on } from '@ngrx/store';
import { initialUiState } from './ui.state';
import * as UiActions from './ui.actions';

// Helper to save numeric values to localStorage
const saveToStorage = (key: string, value: number | boolean | string): void => {
  try {
    localStorage.setItem(key, typeof value === 'number' ? value.toString() : JSON.stringify(value));
  } catch (e) {
    console.warn(`[UI] Failed to save ${key} to localStorage:`, e);
  }
};

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
  on(UiActions.setPerformanceMonitorThemeColor, (state, { themeColor }) => {
    // Save to localStorage
    try {
      localStorage.setItem('performanceMonitorThemeColor', themeColor);
    } catch (e) {
      console.warn('[UI] Failed to save theme color to localStorage:', e);
    }
    return {
      ...state,
      performanceMonitorThemeColor: themeColor
    };
  }),
  on(UiActions.toggleBackgroundAnimation, state => {
    const newValue = !state.enableBackgroundAnimation;
    // Save to localStorage
    try {
      localStorage.setItem('enableBackgroundAnimation', JSON.stringify(newValue));
    } catch (e) {
      console.warn('[UI] Failed to save background animation state to localStorage:', e);
    }
    return {
      ...state,
      enableBackgroundAnimation: newValue
    };
  }),
  on(UiActions.setBackgroundAnimation, (state, { enableBackgroundAnimation }) => {
    // Save to localStorage
    try {
      localStorage.setItem('enableBackgroundAnimation', JSON.stringify(enableBackgroundAnimation));
    } catch (e) {
      console.warn('[UI] Failed to save background animation state to localStorage:', e);
    }
    return {
      ...state,
      enableBackgroundAnimation
    };
  }),
  // Particle physics reducers
  on(UiActions.toggleMagneticForce, state => {
    const newValue = !state.enableMagneticForce;
    try {
      localStorage.setItem('enableMagneticForce', JSON.stringify(newValue));
    } catch (e) {
      console.warn('[UI] Failed to save magnetic force state to localStorage:', e);
    }
    return {
      ...state,
      enableMagneticForce: newValue
    };
  }),
  on(UiActions.setMagneticForce, (state, { enableMagneticForce }) => {
    try {
      localStorage.setItem('enableMagneticForce', JSON.stringify(enableMagneticForce));
    } catch (e) {
      console.warn('[UI] Failed to save magnetic force state to localStorage:', e);
    }
    return {
      ...state,
      enableMagneticForce
    };
  }),
  on(UiActions.toggleRepulsionForce, state => {
    const newValue = !state.enableRepulsionForce;
    try {
      localStorage.setItem('enableRepulsionForce', JSON.stringify(newValue));
    } catch (e) {
      console.warn('[UI] Failed to save repulsion force state to localStorage:', e);
    }
    return {
      ...state,
      enableRepulsionForce: newValue
    };
  }),
  on(UiActions.setRepulsionForce, (state, { enableRepulsionForce }) => {
    try {
      localStorage.setItem('enableRepulsionForce', JSON.stringify(enableRepulsionForce));
    } catch (e) {
      console.warn('[UI] Failed to save repulsion force state to localStorage:', e);
    }
    return {
      ...state,
      enableRepulsionForce
    };
  }),
  on(UiActions.toggleDamping, state => {
    const newValue = !state.enableDamping;
    try {
      localStorage.setItem('enableDamping', JSON.stringify(newValue));
    } catch (e) {
      console.warn('[UI] Failed to save damping state to localStorage:', e);
    }
    return {
      ...state,
      enableDamping: newValue
    };
  }),
  on(UiActions.setDamping, (state, { enableDamping }) => {
    try {
      localStorage.setItem('enableDamping', JSON.stringify(enableDamping));
    } catch (e) {
      console.warn('[UI] Failed to save damping state to localStorage:', e);
    }
    return {
      ...state,
      enableDamping
    };
  }),
  on(UiActions.toggleBrownianMotion, state => {
    const newValue = !state.enableBrownianMotion;
    try {
      localStorage.setItem('enableBrownianMotion', JSON.stringify(newValue));
    } catch (e) {
      console.warn('[UI] Failed to save Brownian motion state to localStorage:', e);
    }
    return {
      ...state,
      enableBrownianMotion: newValue
    };
  }),
  on(UiActions.setBrownianMotion, (state, { enableBrownianMotion }) => {
    try {
      localStorage.setItem('enableBrownianMotion', JSON.stringify(enableBrownianMotion));
    } catch (e) {
      console.warn('[UI] Failed to save Brownian motion state to localStorage:', e);
    }
    return {
      ...state,
      enableBrownianMotion
    };
  }),
  on(UiActions.toggleClusterBreaking, state => {
    const newValue = !state.enableClusterBreaking;
    try {
      localStorage.setItem('enableClusterBreaking', JSON.stringify(newValue));
    } catch (e) {
      console.warn('[UI] Failed to save cluster breaking state to localStorage:', e);
    }
    return {
      ...state,
      enableClusterBreaking: newValue
    };
  }),
  on(UiActions.setClusterBreaking, (state, { enableClusterBreaking }) => {
    saveToStorage('enableClusterBreaking', enableClusterBreaking);
    return { ...state, enableClusterBreaking };
  }),
  // Animation configuration reducers
  on(UiActions.setNumPoints, (state, { value }) => {
    saveToStorage('numPoints', value);
    return { ...state, numPoints: value };
  }),
  on(UiActions.setConnectionRadius, (state, { value }) => {
    saveToStorage('connectionRadius', value);
    return { ...state, connectionRadius: value };
  }),
  on(UiActions.setMagneticRadius, (state, { value }) => {
    saveToStorage('magneticRadius', value);
    return { ...state, magneticRadius: value };
  }),
  on(UiActions.setMagneticStrengthValue, (state, { value }) => {
    saveToStorage('magneticStrength', value);
    return { ...state, magneticStrength: value };
  }),
  on(UiActions.setMinSpeed, (state, { value }) => {
    saveToStorage('minSpeed', value);
    return { ...state, minSpeed: value };
  }),
  on(UiActions.setMaxSpeed, (state, { value }) => {
    saveToStorage('maxSpeed', value);
    return { ...state, maxSpeed: value };
  }),
  on(UiActions.setPointsSize, (state, { value }) => {
    saveToStorage('pointsSize', value);
    return { ...state, pointsSize: value };
  }),
  on(UiActions.setLineWidth, (state, { value }) => {
    saveToStorage('lineWidth', value);
    return { ...state, lineWidth: value };
  }),
  on(UiActions.setRepulsionRadiusValue, (state, { value }) => {
    saveToStorage('repulsionRadius', value);
    return { ...state, repulsionRadius: value };
  }),
  on(UiActions.setRepulsionStrengthValue, (state, { value }) => {
    saveToStorage('repulsionStrength', value);
    return { ...state, repulsionStrength: value };
  }),
  on(UiActions.setDampingFactorValue, (state, { value }) => {
    saveToStorage('dampingFactor', value);
    return { ...state, dampingFactor: value };
  }),
  on(UiActions.setBrownianStrengthValue, (state, { value }) => {
    saveToStorage('brownianStrength', value);
    return { ...state, brownianStrength: value };
  }),
  on(UiActions.setClusterThresholdValue, (state, { value }) => {
    saveToStorage('clusterThreshold', value);
    return { ...state, clusterThreshold: value };
  }),
  on(UiActions.setExplosionForceValue, (state, { value }) => {
    saveToStorage('explosionForce', value);
    return { ...state, explosionForce: value };
  }),
  on(UiActions.setClusterCheckIntervalValue, (state, { value }) => {
    saveToStorage('clusterCheckInterval', value);
    return { ...state, clusterCheckInterval: value };
  }),
  on(UiActions.setMinClusterSizeValue, (state, { value }) => {
    saveToStorage('minClusterSize', value);
    return { ...state, minClusterSize: value };
  }),
  // Reset all animation settings
  on(UiActions.resetAnimationSettings, state => {
    // Clear all animation-related localStorage items
    const animKeys = ['numPoints', 'connectionRadius', 'magneticRadius', 'magneticStrength',
      'minSpeed', 'maxSpeed', 'pointsSize', 'lineWidth', 'repulsionRadius', 'repulsionStrength',
      'dampingFactor', 'brownianStrength', 'clusterThreshold', 'explosionForce',
      'clusterCheckInterval', 'minClusterSize'];
    animKeys.forEach(key => {
      try { localStorage.removeItem(key); } catch { /* ignore */ }
    });
    return {
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
      minClusterSize: 8
    };
  })
);
