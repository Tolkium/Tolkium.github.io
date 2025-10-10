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