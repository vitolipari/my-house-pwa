import { inject } from '@angular/core';
import { CanMatchFn, Route, Router, UrlSegment, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth';
import { AccessControlService } from '../services/access-control.service';
import { AccessControlData } from '../models/access-control.models';

// carica l'utente, valuta le regole della rotta e, se l'accesso non è consentito, reindirizza spiegando il motivo
export const routeMatchGuard: CanMatchFn = (
  route: Route,
  segments: UrlSegment[]
): Promise<boolean | UrlTree> => {
  const authService = inject<AuthService>(AuthService);
  const accessControlService = inject(AccessControlService);
  const router = inject(Router);

  const config = route.data?.['accessControl'] as AccessControlData | undefined;
  const url = '/' + segments.map(segment => segment.path).join('/');

  return (
    authService.ensureUserLoaded()
      .then(user => accessControlService.evaluateAccess(user, url, config))
      .then(result => {
        if (result.allowed) {
          return true;
        }

        const redirectUrl = accessControlService.resolveRedirect(
          result.reason ?? 'FORBIDDEN',
          config
        );

        return router.createUrlTree([redirectUrl], {
          queryParams: {
            from: url,
            reason: result.reason
          }
        });
      })
  );
};
