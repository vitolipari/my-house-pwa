import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {ZoneType} from '../devices/devices.models';
import {EventTimerType, FullTimerType, TimerType} from './timer.models';

/*
Dal CORE
// Zones and Rooms ===============================================================================================================
app.get(    '/rooms',       requirePermission(['READ_ROOMS']),                              roomsRequest        )
app.get(    '/room/:id',    requirePermission(['READ_ROOM']),                               roomRequest         )
app.post(   '/room',        requirePermission(['READ_ROOMS', 'READ_ROOM', 'CREATE_ROOMS']), createRoomRequest   )
app.put(    '/room/:id',    requirePermission(['READ_ROOMS', 'READ_ROOM', 'EDIT_ROOM']),    editRoomRequest     )
app.delete( '/room/:id',    requirePermission(['READ_ROOMS', 'READ_ROOM', 'DELETE_ROOM']),  deleteRoomRequest   )
app.delete( '/rooms/:ids',  requirePermission(['READ_ROOMS', 'DELETE_ROOM']),               deleteRoomsRequest  )
 */

@Injectable({providedIn: 'root'})
export class TimerApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = '/api/core';



    // searchRooms(searchParams?: {
    //     id?: number | number[];
    //     name?: string;
    //     devices?: number[];
    //     pageSize?: number;
    //     pageNumber?: number;
    // }): Observable<ZoneType[]> {
    //     return this.http.get<ZoneType[]>(`${this.baseUrl}/rooms`, {params});
    // }

    searchTimers(searchParams?: {
        id?: number | number[];
        name?: string;
        almostStartAt?: string | number;
        almostStopAt?: string | number;
        isInHolidaysToo?: boolean;
        pageSize?: number;
        pageNumber?: number;
    }): Observable<FullTimerType[]> {
        let params = new HttpParams();
        if(!!searchParams) {
            // page size
            if(!!searchParams.pageSize) {
                params = params.set('pagesize', searchParams.pageSize);
            }

            // pageNumber
            if(!!searchParams.pageNumber) {
                params = params.set('pagenumber', searchParams.pageNumber);
            }

            // name
            if(!!searchParams.name) {
                params = params.set('name', searchParams.name);
            }

            // ids o id
            if(Array.isArray(searchParams.id) ? searchParams.id.length > 0 : searchParams.id !== undefined) {
                params = params.set('id', ([] as number[]).concat(searchParams.id as any).join(','));
            }

            // isInHolidays
            if(!!searchParams.isInHolidaysToo) {
                params = params.set('isinholidays', searchParams.isInHolidaysToo);
            }

            // almostStartAt
            if(!!searchParams.almostStartAt) {
                params = params.set('almoststartat', searchParams.almostStartAt);
            }

            // almostStopAt
            if(!!searchParams.almostStopAt) {
                params = params.set('almoststopat', searchParams.almostStopAt);
            }

        }
        return this.http.get<FullTimerType[]>(`${this.baseUrl}/timers`, { params });

    }

    newTimer(data: TimerType): Observable<EventTimerType[]> {
        let url = `${this.baseUrl}/timer`;
        return this.http.post<EventTimerType[]>(url, data);
    }

    // editRoom(data: ZoneType): Observable<ZoneType> {
    //     let url = `${this.baseUrl}/room/${ data.id }`;
    //     return this.http.put<ZoneType>(url, data);
    // }


    deleteTimers(ids: number[]): Observable<number[]> {
        let url = `${this.baseUrl}/timers?ids=${ ids.join(',') }`;
        return this.http.delete<number[]>(url);
    }


    toggleTimer(id: number, event: boolean): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/toggle-timer/${id}?enabled=${event}`, {});
    }
}
