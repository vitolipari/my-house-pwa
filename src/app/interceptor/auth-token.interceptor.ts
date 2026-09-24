import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthService} from '../services/auth';
import {environment} from '../../environments';



// con un URL assoluto la base viene ignorata, con uno relativo si usa l'origine della PWA
function getPathname(url: string): string {
    return new URL(url, window.location.origin).pathname;
}

function isNoAuthPath(url: string): boolean {
    const pathname = getPathname(url);

    return environment.NO_AUTH_PATHS.some((path: string) => pathname === path);
}


export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {


    if (isNoAuthPath(req.url)) {
        return next(req);
    }

    const authService = inject<AuthService>(AuthService);
    const token = authService.getToken();

    if (!token) {
        return next(req);
    }

    const cloned = req.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`
        }
    });

    return next(cloned);
};
