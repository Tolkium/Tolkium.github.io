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