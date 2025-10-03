export interface UiState {
  isDarkMode: boolean;
  isMenuCollapsed: boolean;
  isMobile: boolean;
  isScrollbarHidden: boolean;
}

export const initialUiState: UiState = {
  isDarkMode: false,
  isMenuCollapsed: true,
  isMobile: window.innerWidth < 768,
  isScrollbarHidden: true
};
