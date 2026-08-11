import {inject} from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivateFn,
    Router,
    RouterStateSnapshot,
    UrlTree
} from '@angular/router';
import {AuthService} from '../services/auth';
import {PermissionService} from '../services/permission.service';
import {LoggedUser, RouteAccessConfig} from '../models/auth.models';

export const routeAccessGuard: CanActivateFn = async (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
): Promise<boolean | UrlTree> => {
    const authService = inject<AuthService>(AuthService);
    const permissionService = inject(PermissionService);
    const router = inject(Router);

    console.log('caso route-access.guard');
    const config = route.data['accessControl'] as RouteAccessConfig | undefined;


    return (
        authService.ensureUserLoaded()
            .then((user: LoggedUser) => {
                console.log('dentro user');
                console.log(user);

                if (!user) {
                    console.log('caso 1');
                    return router.createUrlTree([config?.redirectTo?.notLogged ?? '/access/sign-in'], {
                        queryParams: {from: state.url}
                    });
                }


                if(!config) {
                    // accesso illimitato
                    console.log('route-access.guard accesso illimitato');
                    return true;
                }
                else {
                    if(user.permissions.includes(config.permission)) {
                        console.log('route-access.guard accesso per permesso');
                        // return router.createUrlTree(['/dashboard', {permissionAccessType: 'role or persmission'}]);
                        return true;
                    }
                    if(user.authorizations.includes(config.permission)) {
                        console.log('route-access.guard accesso per autorizzazione');
                        // return router.createUrlTree(['/dashboard', {permissionAccessType: 'authorizated'}]);
                        return true;
                    }
                }


                console.log('route-access.guard  nessun if');
                return router.createUrlTree([config?.redirectTo?.forbidden ?? '/unauthorized']);

                // return true;
            })
            .catch((e: any) => {
                console.log('errore di route-access.guard');
                console.log(e);

                if(e === 'no-token') {
                    return router.createUrlTree(['/access/sign-in']);
                }

                return router.createUrlTree(['/error'], e);
            })
    );


};
