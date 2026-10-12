import {TestBed} from '@angular/core/testing';
import {HttpClient, provideHttpClient, withInterceptors} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {firstValueFrom} from 'rxjs';
import {clearOfflineCache, coreOffline, offlineCacheInterceptor} from './offline-cache.interceptor';

describe('offlineCacheInterceptor', () => {
    let http: HttpClient;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        localStorage.clear();
        coreOffline.set(false);
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptors([offlineCacheInterceptor])),
                provideHttpClientTesting()
            ]
        });
        http = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
    });

    it('salva la lettura riuscita e la restituisce quando il Core non risponde', () => {
        const devices = [{id: 1, status: [1], lastTime: [1760000000]}];

        const online = firstValueFrom(http.get('/api/core/devices'));
        httpMock.expectOne('/api/core/devices').flush(devices);

        return online
            .then((body: any) => {
                expect(body).toEqual(devices);
                expect(coreOffline()).toBe(false);

                const offline = firstValueFrom(http.get('/api/core/devices'));
                httpMock.expectOne('/api/core/devices').error(new ProgressEvent('error'), {status: 0});
                return offline;
            })
            .then((body: any) => {
                expect(body).toEqual(devices);
                expect(coreOffline()).toBe(true);
            })
            .catch((e: any) => {
                console.log('errore nel test offlineCacheInterceptor: copia locale');
                console.log(e);
                return Promise.reject(e);
            });
    });

    it('con 502 di Nginx e senza copia locale propaga l\'errore', () => {
        const request = firstValueFrom(http.get('/api/core/rooms'));
        httpMock.expectOne('/api/core/rooms').flush('<html>502</html>', {status: 502, statusText: 'Bad Gateway'});

        return request
            .then(() => {
                throw new Error('la richiesta doveva fallire');
            })
            .catch((e: any) => {
                console.log('errore atteso nel test offlineCacheInterceptor: nessuna copia');
                console.log(e?.status);
                expect(e.status).toBe(502);
                expect(coreOffline()).toBe(false);
            });
    });

    it('non usa la copia per errori applicativi né per le scritture, e il logout la cancella', () => {
        localStorage.setItem('liparios_cache:/api/core/groups', '[]');

        const forbidden = firstValueFrom(http.get('/api/core/groups'));
        httpMock.expectOne('/api/core/groups').flush('vietato', {status: 403, statusText: 'Forbidden'});

        return forbidden
            .then(() => {
                throw new Error('la richiesta 403 doveva fallire');
            })
            .catch((e: any) => {
                console.log('errore atteso nel test offlineCacheInterceptor: 403');
                console.log(e?.status);
                expect(e.status).toBe(403);
                http.post('/api/core/groups', {}).subscribe({error: () => undefined});
                httpMock.expectOne('/api/core/groups').flush({});
                expect(localStorage.getItem('liparios_cache:/api/core/groups')).toBe('[]');
                clearOfflineCache();
                expect(localStorage.getItem('liparios_cache:/api/core/groups')).toBeNull();
            });
    });
});
