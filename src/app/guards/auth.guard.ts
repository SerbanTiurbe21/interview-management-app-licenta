import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const canActivate = (
  router: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
):
  | boolean
  | UrlTree
  | Promise<boolean | UrlTree>
  | Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const route = inject(Router);
  const isAuthenticated = authService.isAuthenticated();
  if (isAuthenticated) {
    return true;
  } else {
    return route.createUrlTree(['/login']);
  }
};
