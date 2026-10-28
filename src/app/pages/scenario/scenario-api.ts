import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {ScenarioSearchParamsType, ScenarioType} from './scenario.models';


@Injectable({providedIn: 'root'})
export class ScenarioApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = '/api/core';


    /*
        id=44
    	ids=1,8,22,95,3,14
        idf=1&idt=99
        name=Nel mezzo del cammin di nostra vita
        enabled=1
        enabled=true
        pagesize=100
        pagenumber=1
        device-trigger=1,2,3,4,5
        device-action=6,7,8,9,10
     */
    searchScenarios(searchParams?: ScenarioSearchParamsType): Observable<ScenarioType[]> {
        let params = new HttpParams();
        if(!!searchParams) {
            // page size
            if(!!searchParams.pagesize) {
                params = params.set('pagesize', searchParams.pagesize);
            }

            // pageNumber
            if(!!searchParams.pagenumber) {
                params = params.set('pagenumber', searchParams.pagenumber);
            }

            // name
            if(!!searchParams.name) {
                params = params.set('name', searchParams.name);
            }

            // id
            if(!!searchParams.id) {
                params = params.set('id', searchParams.id);
            }

            // ids o id
            if(Array.isArray(searchParams.ids) ? searchParams.ids.length > 0 : searchParams.ids !== undefined) {
                params = params.set('ids', ([] as number[]).concat(searchParams.ids as any).join(','));
            }

            // altri parametri

        }
        return this.http.get<ScenarioType[]>(`${this.baseUrl}/scenarios`, { params });

    }


}
