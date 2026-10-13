import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {ZoneType} from '../devices/devices.models';
import {EventTimerType, TimerType} from './timer.models';

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
    //     let params = new HttpParams();
    //     if(!!searchParams) {
    //         if(!!searchParams.pageSize) {
    //             params = params.set('pagesize', searchParams.pageSize);
    //         }
    //         if(!!searchParams.pageNumber) {
    //             params = params.set('pagenumber', searchParams.pageNumber);
    //         }
    //         if(!!searchParams.name) {
    //             params = params.set('name', searchParams.name);
    //         }
    //         if(Array.isArray(searchParams.id) ? searchParams.id.length > 0 : searchParams.id !== undefined) {
    //             params = params.set('id', ([] as number[]).concat(searchParams.id as any).join(','));
    //         }
    //         if(!!searchParams.devices && searchParams.devices.length > 0) {
    //             params = params.set('devices', searchParams.devices.join(','));
    //         }
    //     }
    //     return this.http.get<ZoneType[]>(`${this.baseUrl}/rooms`, {params});
    // }

    newTimer(data: TimerType): Observable<EventTimerType[]> {
        let url = `${this.baseUrl}/timer`;
        return this.http.post<EventTimerType[]>(url, data);
    }

    // editRoom(data: ZoneType): Observable<ZoneType> {
    //     let url = `${this.baseUrl}/room/${ data.id }`;
    //     return this.http.put<ZoneType>(url, data);
    // }


    // deleteRooms(rooms: ZoneType[]): Observable<ZoneType> {
    //     let url = `${this.baseUrl}/rooms?ids=${ rooms.map((room: ZoneType) => room.id).join(',') }`;
    //     return this.http.delete<ZoneType>(url);
    // }


}
