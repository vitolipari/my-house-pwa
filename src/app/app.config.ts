import {ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode} from '@angular/core';
import {provideRouter} from '@angular/router';
import {routes} from './app.routes';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {provideServiceWorker} from '@angular/service-worker';
import {authTokenInterceptor} from './interceptor/auth-token.interceptor';
import {secureConInterceptor} from './modules/secure-con/securecon.interceptor';
import {providePrimeNG} from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import {apiBaseUrlInterceptor} from './interceptor/api-base-url-interceptor';


// {
//     provide: HTTP_INTERCEPTORS,
//         useClass: ApiBaseUrlInterceptor,
//     multi: true
// }


export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes),
        provideHttpClient(
            withFetch(),
            withInterceptors([
                apiBaseUrlInterceptor,
                authTokenInterceptor,
                secureConInterceptor
            ])
        ),
        provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerImmediately'
        }),
        provideAnimationsAsync(),
        providePrimeNG({
            theme: {
                preset: Aura
            }
        })
    ]
};
