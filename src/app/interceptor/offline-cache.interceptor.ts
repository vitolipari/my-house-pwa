import {HttpErrorResponse, HttpInterceptorFn, HttpResponse} from '@angular/common/http';
import {signal} from '@angular/core';
import {catchError, of, tap, throwError} from 'rxjs';


// prefisso delle chiavi in localStorage per la copia locale delle letture
const OFFLINE_CACHE_PREFIX = 'liparios_cache:';

// letture che restano consultabili quando il Core non risponde
const OFFLINE_CACHE_PATHS: string[] = [
    '/api/core/devices',
    '/api/core/device/status/',
    '/api/core/rooms',
    '/api/core/groups',
    '/profile/me'
];

// true quando l'ultima lettura è stata servita dalla copia locale perché il Core non risponde
export const coreOffline = signal<boolean>(false);


function isCachedPath(url: string): boolean {
    return OFFLINE_CACHE_PATHS.some((path: string) => url.startsWith(path));
}

/*
Il Core è irraggiungibile quando la rete fallisce (TypeError di fetch), quando Nginx risponde con una
pagina HTML (502/503/504) o quando l'handshake SecureCon non riceve JSON (SyntaxError).
L'interceptor SecureCon rilancia e.error al posto della HttpErrorResponse, per questo si guardano entrambe le forme.
 */
function isCoreUnreachable(e: any): boolean {
    if (e instanceof HttpErrorResponse) {
        return [0, 502, 503, 504].includes(e.status);
    }
    return (
        e instanceof TypeError
        || e instanceof SyntaxError
        || (typeof e === 'string' && e.trim().startsWith('<'))
    );
}

// cancella la copia locale, usata al logout perché i dati appartengono all'utente uscito
export function clearOfflineCache(): void {
    Object.keys(localStorage)
        .filter((key: string) => key.startsWith(OFFLINE_CACHE_PREFIX))
        .forEach((key: string) => localStorage.removeItem(key));
}

/*
Salva in localStorage il body delle letture riuscite e, se il Core è irraggiungibile, restituisce l'ultima copia.
Sta per primo nella catena: vede l'URL relativo e le risposte già decifrate da SecureCon.
Le scritture non passano di qui: con il Core offline falliscono come prima.
 */
export const offlineCacheInterceptor: HttpInterceptorFn = (req, next) => {

    if (req.method !== 'GET' || !isCachedPath(req.url)) {
        return next(req);
    }

    const cacheKey = OFFLINE_CACHE_PREFIX + req.urlWithParams;

    return next(req).pipe(
        tap((event: any) => {
            if (event instanceof HttpResponse) {
                coreOffline.set(false);
                try {
                    localStorage.setItem(cacheKey, JSON.stringify(event.body));
                } catch (e) {
                    console.log('errore in offlineCacheInterceptor: scrittura della copia locale');
                    console.log(e);
                }
            }
        }),
        catchError((e: any) => {
            console.log('errore in offlineCacheInterceptor: lettura dal Core di ' + req.urlWithParams);
            console.log(e);

            const cached = localStorage.getItem(cacheKey);
            if (!isCoreUnreachable(e) || cached === null) {
                return throwError(() => e);
            }

            console.log('Core irraggiungibile, uso la copia locale di ' + req.urlWithParams);
            coreOffline.set(true);
            return of(new HttpResponse({status: 200, url: req.urlWithParams, body: JSON.parse(cached)}));
        })
    );
};
