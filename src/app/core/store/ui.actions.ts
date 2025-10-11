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