import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import * as UiActions from './ui.actions';

@Injectable()
export class UiEffects {
  constructor(private actions$: Actions) {}

  persistDarkMode$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UiActions.setDarkMode, UiActions.toggleDarkMode),
      tap(action => {
        if (action.type === '[UI] Toggle Dark Mode') {
          const currentDarkMode = document.documentElement.classList.contains('dark');
          localStorage.setItem('darkMode', JSON.stringify(!currentDarkMode));
          document.documentElement.classList.toggle('dark');
        } else {
          localStorage.setItem('darkMode', JSON.stringify(action.isDarkMode));
          if (action.isDarkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      })
    ),
    { dispatch: false }
  );

  persistMenuCollapse$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UiActions.setMenuCollapse, UiActions.toggleMenuCollapse),
      tap(action => {
        if (action.type === '[UI] Toggle Menu Collapse') {
          const currentState = localStorage.getItem('menuCollapsed');
          const newState = currentState ? !JSON.parse(currentState) : true;
          localStorage.setItem('menuCollapsed', JSON.stringify(newState));
        } else {
          localStorage.setItem('menuCollapsed', JSON.stringify(action.isCollapsed));
        }
      })
    ),
    { dispatch: false }
  );
}
