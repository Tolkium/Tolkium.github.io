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
  enableBackgroundAnimation: boolean;
  // Particle physics toggle settings
  enableMagneticForce: boolean;
  enableRepulsionForce: boolean;
  enableDamping: boolean;
  enableBrownianMotion: boolean;
  // Animation configuration values
  numPoints: number;
  connectionRadius: number;
  magneticRadius: number;
  magneticStrength: number;
  minSpeed: number;
  maxSpeed: number;
  pointsSize: number;
  lineWidth: number;
  repulsionRadius: number;
  repulsionStrength: number;
  dampingFactor: number;
  brownianStrength: number;
  enablePolygonStabilizer: boolean;
  polygonTargetSpacing: number;
  polygonStrength: number;

  // Magnetic cooldown settings
  enableCooldownAttraction: boolean;
  cooldownMinDistance: number;
  cooldownResetDistance: number;
  cooldownDuration: number;
}

// Helper function to load numeric values from localStorage
const loadNumberFromStorage = (key: string, defaultValue: number): number => {
  try {
    const saved = localStorage.getItem(key);
    return saved !== null ? parseFloat(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// Helper function to load boolean values from localStorage
const loadBooleanFromStorage = (key: string, defaultValue: boolean): boolean => {
  try {
    const saved = localStorage.getItem(key);
    return saved !== null ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
};

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
  })(),
  enableBackgroundAnimation: loadBooleanFromStorage('enableBackgroundAnimation', true),
  // Particle physics toggle settings - all enabled by default for best behavior
  enableMagneticForce: loadBooleanFromStorage('enableMagneticForce', true),
  enableRepulsionForce: loadBooleanFromStorage('enableRepulsionForce', true),
  enableDamping: loadBooleanFromStorage('enableDamping', true),
  enableBrownianMotion: loadBooleanFromStorage('enableBrownianMotion', true),
  // Animation configuration values - load from localStorage or use defaults
  numPoints: loadNumberFromStorage('numPoints', 110),
  connectionRadius: loadNumberFromStorage('connectionRadius', 200),
  magneticRadius: loadNumberFromStorage('magneticRadius', 100),
  magneticStrength: loadNumberFromStorage('magneticStrength', 0.0001),
  minSpeed: loadNumberFromStorage('minSpeed', 0.25),
  maxSpeed: loadNumberFromStorage('maxSpeed', 0.6),
  pointsSize: loadNumberFromStorage('pointsSize', 5),
  lineWidth: loadNumberFromStorage('lineWidth', 5),
  repulsionRadius: loadNumberFromStorage('repulsionRadius', 5),
  repulsionStrength: loadNumberFromStorage('repulsionStrength', 5),
  dampingFactor: loadNumberFromStorage('dampingFactor', 0.95),
  brownianStrength: loadNumberFromStorage('brownianStrength', 0.02),
  enablePolygonStabilizer: loadBooleanFromStorage('enablePolygonStabilizer', false),
  polygonTargetSpacing: loadNumberFromStorage('polygonTargetSpacing', 120),
  polygonStrength: loadNumberFromStorage('polygonStrength', 0.0008),

  // Magnetic cooldown - default: off, 20px min distance, 80px reset distance, 3000ms duration
  enableCooldownAttraction: loadBooleanFromStorage('enableCooldownAttraction', false),
  cooldownMinDistance: loadNumberFromStorage('cooldownMinDistance', 20),
  cooldownResetDistance: loadNumberFromStorage('cooldownResetDistance', 80),
  cooldownDuration: loadNumberFromStorage('cooldownDuration', 3000)
};
