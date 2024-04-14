import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LogginginterceptorService implements HttpInterceptor {
  constructor() {}
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const started: number = Date.now();

    const authReq: HttpRequest<any> = req.clone();

    return next.handle(authReq).pipe(
      tap({
        next: (event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            const elapsed = Date.now() - started;
            console.log(
              `Request for ${req.urlWithParams} succeeded in ${elapsed} ms.`
            );
          }
        },
        error: (error: HttpErrorResponse) => {
          const elapsed = Date.now() - started;
          console.log(
            `Request for ${req.urlWithParams} failed in ${elapsed} ms. Error: ${error.status} ${error.statusText}`
          );
        },
        complete: () =>
          console.log(`Request for ${req.urlWithParams} completed.`),
      })
    );
  }
}
