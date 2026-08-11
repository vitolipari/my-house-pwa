import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {from, Observable, switchMap} from 'rxjs';

import {catchError, firstValueFrom, of, timeout} from 'rxjs';
import {environment} from '../../environments';

@Injectable({ providedIn: 'root' })
export class ApiUrlService {

    private readonly http = inject(HttpClient);

    resolveApiBaseUrl(): Promise<string> {
        return Promise.resolve(environment.apiBaseUrl);
    }

    getUsers(): Observable<any[]> {
        return this.http.get<any[]>('/api/core/users')
    }

    netScan(): Observable<any[]>  {
        return this.http.get<any[]>('/api/core/netscan');
    }
}
