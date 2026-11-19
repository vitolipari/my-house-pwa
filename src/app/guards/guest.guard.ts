import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

// sign-in e sign-up solo per chi non ha fatto l'accesso: con il token si va alla dashboard,
// anche tornando indietro nella cronologia (swipe o tasto indietro del telefono)
export const guestGuard: CanActivateFn = () => {
  const authService = inject<AuthService>(AuthService);
  const router = inject(Router);

  // authService.ensureUserLoaded().then(user => ...)



  // if (user) {
  //   return router.createUrlTree(['/startup']);
  // }

  // hasToken legge localStorage: dopo il logout il token non c'è più e la pagina si apre
  if (authService.hasToken()) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
