import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { uiReducer } from './core/store/ui.reducer';
import { UiEffects } from './core/store/ui.effects';
// import { provideIcons } from '@ng-icons/core';
// import {
//   heroCog6Tooth,
//   heroFolder,
//   heroChartBarSquare,
//   heroPresentationChartLine,
//   heroClipboardDocumentList,
//   heroSquares2X2,
//   heroCommandLine,
//   heroSwatch,
//   heroCalendarDays,
//   heroCodeBracketSquare,
//   heroCube,
//   heroSquaresPlus,
//   heroBeaker,
//   heroArchiveBox,
//   heroDevicePhoneMobile,
//   heroSparkles,
//   heroDocumentText,
//   heroCubeTransparent,
//   heroServerStack,
//   heroArrowDownTray,
//   heroPhoto,
//   heroUsers,
//   heroCog8Tooth,
//   heroMoon,
//   heroSun,
// } from '@ng-icons/heroicons/outline';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideStore({ ui: uiReducer }),
    provideEffects([UiEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      traceLimit: 75,
    }),
    provideIcons({
      heroCog6Tooth,
      heroFolder,
      heroChartBarSquare,
      heroPresentationChartLine,
      heroClipboardDocumentList,
      heroSquares2X2,
      heroCommandLine,
      heroSwatch,
      heroCalendarDays,
      heroCodeBracketSquare,
      heroCube,
      heroSquaresPlus,
      heroBeaker,
      heroArchiveBox,
      heroDevicePhoneMobile,
      heroSparkles,
      heroDocumentText,
      heroCubeTransparent,
      heroServerStack,
      heroArrowDownTray,
      heroPhoto,
      heroUsers,
      heroCog8Tooth,
      heroMoon,
      heroSun,
    })
  ],
};
