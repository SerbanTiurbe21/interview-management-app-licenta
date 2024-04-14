import {
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, first, mergeMap, take } from 'rxjs';
import { AuthService } from './auth.service';
import { StoredUser } from '../interfaces/user/storeduser.model';

@Injectable({
  providedIn: 'root',
})
export class TokeninterceptorserviceService implements HttpInterceptor {
  constructor(private authService: AuthService) {}
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    console.log('Intercepted request:', req);
    const bypassEndpoints: string[] = [
      'http://localhost:9090/realms/springboot-microservice-realm/protocol/openid-connect/token',
      'http://localhost:8080/api/v1/users/email',
    ];

    const isBypassed = bypassEndpoints.some((url) => req.url.includes(url));

    if (!isBypassed) {
      return this.authService.getActiveUser().pipe(
        first(),
        mergeMap((currentUser: StoredUser | null) => {
          if (currentUser) {
            const modifiedReq = req.clone({
              headers: new HttpHeaders({
                Authorization: `Bearer ${currentUser.token}`,
              }),
            });
            return next.handle(modifiedReq);
          } else {
            return next.handle(req);
          }
        })
      );
    }
    return next.handle(req);
  }
}
