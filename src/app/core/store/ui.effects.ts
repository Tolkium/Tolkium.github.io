import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { tap, withLatestFrom } from 'rxjs/operators';
import * as UiActions from './ui.actions';
import { selectUiState } from './ui.selectors';

const ANIMATION_STORAGE_KEYS = [
  'numPoints',
  'connectionRadius',
  'magneticRadius',
  'magneticStrength',
  'minSpeed',
  'maxSpeed',
  'pointsSize',
  'lineWidth',
  'repulsionRadius',
  'repulsionStrength',
  'dampingFactor',
  'brownianStrength',
  'clusterThreshold',
  'explosionForce',
  'clusterCheckInterval',
  'minClusterSize',
  'magneticMinStrength',
  'magneticMaxStrength',
  'magneticInverseCoefficient',
  'magneticFluctuationSpeed',
  'enablePolygonStabilizer',
  'polygonTargetSpacing',
  'polygonStrength'
] as const;

@Injectable()
export class UiEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);

  private setBoolean(key: string, value: boolean): void {
    this.setStorageItem(key, JSON.stringify(value));
  }

  private setNumber(key: string, value: number): void {
    this.setStorageItem(key, value.toString());
  }

  private setString(key: string, value: string): void {
    this.setStorageItem(key, value);
  }

  private setStorageItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Ignore localStorage errors to keep UI responsive in restricted environments.
    }
  }

  private removeStorageItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore localStorage errors to keep UI responsive in restricted environments.
    }
  }

  private syncDocumentClasses(isDarkMode: boolean, hideScrollbar: boolean): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.classList.toggle('dark', isDarkMode);
    document.documentElement.classList.toggle('scrollbar-hidden', hideScrollbar);

    if (typeof document.body !== 'undefined') {
      document.body.classList.toggle('scrollbar-hidden', hideScrollbar);
    }
  }

  persistUiState$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          UiActions.toggleDarkMode,
          UiActions.setDarkMode,
          UiActions.toggleMenuCollapse,
          UiActions.setMenuCollapse,
          UiActions.toggleHideScrollbar,
          UiActions.setHideScrollbar,
          UiActions.toggleSparkleEffect,
          UiActions.setSparkleEffect,
          UiActions.toggle3DTiltEffect,
          UiActions.set3DTiltEffect,
          UiActions.toggleHolographicEffect,
          UiActions.setHolographicEffect,
          UiActions.setPerformanceMonitorThemeColor,
          UiActions.toggleBackgroundAnimation,
          UiActions.setBackgroundAnimation,
          UiActions.toggleMagneticForce,
          UiActions.setMagneticForce,
          UiActions.toggleRepulsionForce,
          UiActions.setRepulsionForce,
          UiActions.toggleDamping,
          UiActions.setDamping,
          UiActions.toggleBrownianMotion,
          UiActions.setBrownianMotion,
          UiActions.toggleClusterBreaking,
          UiActions.setClusterBreaking,
          UiActions.setNumPoints,
          UiActions.setConnectionRadius,
          UiActions.setMagneticRadius,
          UiActions.setMagneticStrengthValue,
          UiActions.setMinSpeed,
          UiActions.setMaxSpeed,
          UiActions.setPointsSize,
          UiActions.setLineWidth,
          UiActions.setRepulsionRadiusValue,
          UiActions.setRepulsionStrengthValue,
          UiActions.setDampingFactorValue,
          UiActions.setBrownianStrengthValue,
          UiActions.setClusterThresholdValue,
          UiActions.setExplosionForceValue,
          UiActions.setClusterCheckIntervalValue,
          UiActions.setMinClusterSizeValue,
          UiActions.setMagneticMode,
          UiActions.setMagneticMinStrengthValue,
          UiActions.setMagneticMaxStrengthValue,
          UiActions.setMagneticInverseCoefficientValue,
          UiActions.setMagneticFluctuationSpeedValue,
          UiActions.togglePolygonStabilizer,
          UiActions.setPolygonStabilizer,
          UiActions.setPolygonTargetSpacingValue,
          UiActions.setPolygonStrengthValue
        ),
        withLatestFrom(this.store.select(selectUiState)),
        tap(([, ui]) => {
          this.setBoolean('darkMode', ui.isDarkMode);
          this.setBoolean('menuCollapsed', ui.isMenuCollapsed);
          this.setBoolean('hideScrollbar', ui.hideScrollbar);
          this.setBoolean('enableSparkleEffect', ui.enableSparkleEffect);
          this.setBoolean('enable3DTiltEffect', ui.enable3DTiltEffect);
          this.setBoolean('enableHolographicEffect', ui.enableHolographicEffect);

          this.setString('performanceMonitorThemeColor', ui.performanceMonitorThemeColor);
          this.setBoolean('enableBackgroundAnimation', ui.enableBackgroundAnimation);

          this.setBoolean('enableMagneticForce', ui.enableMagneticForce);
          this.setBoolean('enableRepulsionForce', ui.enableRepulsionForce);
          this.setBoolean('enableDamping', ui.enableDamping);
          this.setBoolean('enableBrownianMotion', ui.enableBrownianMotion);
          this.setBoolean('enableClusterBreaking', ui.enableClusterBreaking);

          this.setNumber('numPoints', ui.numPoints);
          this.setNumber('connectionRadius', ui.connectionRadius);
          this.setNumber('magneticRadius', ui.magneticRadius);
          this.setNumber('magneticStrength', ui.magneticStrength);
          this.setNumber('minSpeed', ui.minSpeed);
          this.setNumber('maxSpeed', ui.maxSpeed);
          this.setNumber('pointsSize', ui.pointsSize);
          this.setNumber('lineWidth', ui.lineWidth);
          this.setNumber('repulsionRadius', ui.repulsionRadius);
          this.setNumber('repulsionStrength', ui.repulsionStrength);
          this.setNumber('dampingFactor', ui.dampingFactor);
          this.setNumber('brownianStrength', ui.brownianStrength);
          this.setNumber('clusterThreshold', ui.clusterThreshold);
          this.setNumber('explosionForce', ui.explosionForce);
          this.setNumber('clusterCheckInterval', ui.clusterCheckInterval);
          this.setNumber('minClusterSize', ui.minClusterSize);

          this.setString('magneticMode', ui.magneticMode);
          this.setNumber('magneticMinStrength', ui.magneticMinStrength);
          this.setNumber('magneticMaxStrength', ui.magneticMaxStrength);
          this.setNumber('magneticInverseCoefficient', ui.magneticInverseCoefficient);
          this.setNumber('magneticFluctuationSpeed', ui.magneticFluctuationSpeed);
          this.setBoolean('enablePolygonStabilizer', ui.enablePolygonStabilizer);
          this.setNumber('polygonTargetSpacing', ui.polygonTargetSpacing);
          this.setNumber('polygonStrength', ui.polygonStrength);

          this.syncDocumentClasses(ui.isDarkMode, ui.hideScrollbar);
        })
      ),
    { dispatch: false }
  );

  clearResetAnimationStorage$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(UiActions.resetAnimationSettings),
        tap(() => {
          for (const key of ANIMATION_STORAGE_KEYS) {
            this.removeStorageItem(key);
          }
        })
      ),
    { dispatch: false }
  );
}


