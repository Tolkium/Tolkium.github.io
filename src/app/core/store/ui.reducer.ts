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
  }))
);
