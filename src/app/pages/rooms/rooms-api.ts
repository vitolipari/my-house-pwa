import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {ZoneType} from '../devices/devices.models';

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
export class RoomsApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = '/api/core';

    searchRooms(pageSize?: number, pageNumber?: number, name?: number, id?: number | number[]): Observable<ZoneType[]> {
        let url = `${this.baseUrl}/rooms`;
        let queryString: string =
            [
                !!pageSize ? pageSize : undefined,
                !!pageNumber ? pageNumber : undefined,
                !!name ? name : undefined,
                !!id ? id : ((Array.isArray(id) && id.length > 0) ? id : undefined)
            ]
                .filter((par: any) => !!par)
                .map((par: any) => {
                    if(Array.isArray(par)) {
                        return par.join(',')
                    }
                    else {
                        return par
                    }
                })
                .map((par: string, index: number) => {
                    switch (index) {
                        case 0:
                            return `pagesize=${par}`;
                        case 1:
                            return `pagenumber=${par}`;
                        case 2:
                            return `name=${par}`;
                        case 3:
                            return `id=${par}`;
                        default:
                            return '';
                    }
                })
                .filter((par: any) => !!par)
                .join('&')
        ;

        url += (!!queryString ? `?${queryString}` : '');
        return this.http.get<ZoneType[]>(url);
    }

    newRoom(data: ZoneType): Observable<number> {
        let url = `${this.baseUrl}/room`;
        return this.http.post<number>(url, data);
    }

}
