import {HttpErrorResponse, HttpInterceptorFn, HttpResponse} from '@angular/common/http';
import {inject} from '@angular/core';
import {catchError, from, map, of, switchMap, throwError} from 'rxjs';

import {SecureCon, SessionDataPackType} from './securecon.service';
import {FREE_PATHS} from './securecon.environment';


export const secureConInterceptor: HttpInterceptorFn = (req, next) => {

    const secureCon: SecureCon = inject(SecureCon);

    function getPathname(url: string): string {
        return new URL(url, window.location.origin).pathname;
    }

    const pathname = getPathname(req.url);

    if( FREE_PATHS.some((freePath) => (pathname === freePath || pathname.startsWith(freePath + '/'))) ) {
        console.log('SESSION INTERCEPTOR - free path '+ pathname);
        return next(req);
    }


    console.log('SESSION INTERCEPTOR - interceptor per sessione '+ pathname);



    return from(
        // prima la sessione (handshake se manca), poi il token di sessione e, se c'è un body, la cifratura
        (!secureCon.session.id ? secureCon.handshake() : Promise.resolve())
            .then(() => secureCon.generateJwtToken({
                sub: secureCon.session.id,
                iat: 0,
                exp: 0
            }))
            .then((token: string) => {
                if(
                    !!req.body
                    && (req.body !== undefined)
                    && (req.body !== null)
                    && (Object.keys(req.body as any).length > 0)
                ) {
                    return (
                        secureCon.encryptBody(req.body || '')
                            .then((payload: any) => ({ token, payload }))
                    );
                }

                return { token, payload: null as any };
            })
    ).pipe(
        switchMap(({ token, payload }) => {

            const clonedReq = req.clone({
                setHeaders: {
                    session: token
                },
                body: payload
            });

            // let clonedReq;
            // if((req.method === 'POST') ) {
            //     clonedReq = req.clone({
            //         setHeaders: {
            //             session: token
            //         },
            //         body: payload
            //     });
            // }
            // else {
            //     clonedReq = req.clone({
            //         setHeaders: {
            //             session: token
            //         }
            //     });
            // }


            return (
                next(clonedReq)
                    .pipe(
                        switchMap((event) => {

                            // console.log('interceptor response 1');
                            // console.log(event);
                            // console.log(typeof event);


                            if ((event instanceof HttpErrorResponse)) {
                                console.log('interceptor error response');
                                console.log(event.error);
                                return [event];
                            }

                            // nessun body
                            // if (
                            //     !(event as HttpResponse<any>).body
                            //     || ((event as HttpResponse<any>).body as any).length === 0
                            //     || Object.keys((event as HttpResponse<any>).body).length === 0
                            //     || !((event as HttpResponse<any>).body as any).iv
                            // ) {
                            //
                            //     console.log('interceptor manca il body');
                            //     console.log(event);
                            //
                            //     return [event];
                            // }

                            if (!(event instanceof HttpResponse)) {

                                console.log('event NON e di tipo HttpResponse');
                                console.log(event as any);

                                return [event];
                            }


                            const body = event.body as any;

                            if (
                                !body ||
                                typeof body !== 'object' ||
                                !body.iv ||
                                !body.payload
                            ) {
                                return of(event);
                            }

                            return from(
                                secureCon.decryptBody((event.body as any).iv, (event.body as any).payload)
                            ).pipe(
                                map((decryptedBody) => {

                                    // console.log('interceptor decrypt');
                                    // console.log(decryptedBody);


                                    return event.clone({
                                        body: decryptedBody
                                    });
                                })
                            );
                        })
                    )
            );
        }),
        catchError((e) => {

            // `e` può essere un HttpErrorResponse che trasporta il body cifrato
            // (`iv`/`payload`) o un errore di decifratura il cui messaggio cita
            // body in chiaro: nel log vanno solo tipo e stato, non l'oggetto
            console.log('errore in secureConInterceptor: status ' + e?.status);
            console.log(e?.name);
            // debugger;
            /*
            HttpErrorResponse = {
                "headers": {
                    "headers": {},
                    "normalizedNames": {},
                    "lazyUpdate": null
                },
                "status": 400,
                "statusText": "Bad Request",
                "url": "http://localhost:4200/profile/signup",
                "ok": false,
                "redirected": false,
                "responseType": "basic",
                "name": "HttpErrorResponse",
                "message": "Http failure response for http://localhost:4200/profile/signup: 400 Bad Request",
                "error": "email esistente!!"
            }


            error: {
                "iv": "vyKmD0QolxMvR7dO",
                "payload": "JZVPjpG7AGUGgGkIdCNQBDELmxGnzf2nRfn7wUP4xnMEbne190DJpzrtmlFsXgJTNr40"
            }
             */

            if( !!e.error ) {

                if( !!e.error.iv && !!e.error.payload ) {
                    // continua
                    let decryptedError: any = e;

                    return from(
                        secureCon.decryptBody(e.error.iv, e.error.payload)
                    ).pipe(
                        switchMap((decryptedBody) => {
                            // il contenuto decifrato non va nel log
                            console.log('decriptato il messaggio di errore');
                            decryptedError = decryptedBody;
                            return throwError(() => decryptedBody);
                        }),
                        catchError((ee: any) => {
                            // l'errore arriva dalla decifratura del body di
                            // errore: il suo messaggio può citare testo in
                            // chiaro, quindi nel log va solo il tipo
                            console.log('errore in secureConInterceptor: decifratura del body di errore');
                            console.log(ee?.name);
                            // debugger;
                            return throwError(() => decryptedError);
                        })
                    );
                }
                else {
                    secureCon.session = {};
                    return throwError(() => e.error);
                }

            }
            else {
                console.log('errore da controllare');
                console.log(e);
                return throwError(() => e);
            }


        })
    );

};
