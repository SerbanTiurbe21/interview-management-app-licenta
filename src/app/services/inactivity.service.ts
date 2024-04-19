import { Injectable } from '@angular/core';
import {
  Observable,
  fromEvent,
  merge,
  switchMap,
  startWith,
  timer,
  map,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InactivityService {
  constructor() {}

  trackInactivity(duration: number): Observable<boolean> {
    const activityEvents$ = merge(
      fromEvent(document, 'mousemove'),
      fromEvent(document, 'keydown'),
      fromEvent(document, 'click')
    );

    return activityEvents$.pipe(
      startWith(null),
      switchMap(() => timer(duration)),
      map(() => true)
    );
  }
}
