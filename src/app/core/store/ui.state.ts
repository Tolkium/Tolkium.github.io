export interface UiState {
  isDarkMode: boolean;
  isMenuCollapsed: boolean;
  isMobile: boolean;
  hideScrollbar: boolean;
  enableSparkleEffect: boolean;
  enable3DTiltEffect: boolean;
  enableHolographicEffect: boolean;
  showPerformanceMonitor: boolean;
  performanceMonitorThemeColor: string;
}

export const initialUiState: UiState = {
  isDarkMode: false,
  isMenuCollapsed: true,
  isMobile: window.innerWidth < 768,
  hideScrollbar: true,
  enableSparkleEffect: true,
  enable3DTiltEffect: true,
  enableHolographicEffect: true,
  showPerformanceMonitor: false,
  performanceMonitorThemeColor: (() => {
    try {
      return localStorage.getItem('performanceMonitorThemeColor') || '#c77dff';
    } catch {
      return '#c77dff';
    }
  })()
};
