import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const guestGuard: CanActivateFn = () => {
  // const authService = inject<AuthService>(AuthService);
  const router = inject(Router);

  // authService.ensureUserLoaded().then(user => ...)



  // if (user) {
  //   return router.createUrlTree(['/startup']);
  // }

  return true;
};
