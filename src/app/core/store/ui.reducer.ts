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
  })
);
