export interface UiState {
  isDarkMode: boolean;
  isMenuCollapsed: boolean;
  isMobile: boolean;
  hideScrollbar: boolean;
  enableSparkleEffect: boolean;
}

export const initialUiState: UiState = {
  isDarkMode: false,
  isMenuCollapsed: true,
  isMobile: window.innerWidth < 768,
  hideScrollbar: true,
  enableSparkleEffect: true
};
