import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {GroupType} from '../devices/devices.models';

/*
Dal CORE
// Devices Groups ======================================================================================================
app.get(    '/groups',      requirePermission(['READ_GROUPS']),                               groupsRequest       )
app.get(    '/group/:id',   requirePermission(['READ_GROUP']),                                groupRequest        )
app.post(   '/group',       requirePermission(['READ_GROUPS', 'READ_GROUP', 'CREATE_GROUPS']), createGroupRequest  )
app.put(    '/group/:id',   requirePermission(['READ_GROUPS', 'READ_GROUP', 'EDIT_GROUP']),    editGroupRequest    )
app.delete( '/group/:id',   requirePermission(['READ_GROUPS', 'READ_GROUP', 'DELETE_GROUP']),  deleteGroupRequest  )
app.delete( '/groups',      requirePermission(['READ_GROUPS', 'DELETE_GROUP']),               deleteGroupsRequest )
 */

@Injectable({providedIn: 'root'})
export class GroupsApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = '/api/core';



    searchGroups(searchParams?: {
        id?: number | number[];
        name?: string;
        devices?: number[];
        pageSize?: number;
        pageNumber?: number;
    }): Observable<GroupType[]> {
        let params = new HttpParams();
        if(!!searchParams) {
            if(!!searchParams.pageSize) {
                params = params.set('pagesize', searchParams.pageSize);
            }
            if(!!searchParams.pageNumber) {
                params = params.set('pagenumber', searchParams.pageNumber);
            }
            if(!!searchParams.name) {
                params = params.set('name', searchParams.name);
            }
            if(Array.isArray(searchParams.id) ? searchParams.id.length > 0 : searchParams.id !== undefined) {
                params = params.set('id', ([] as number[]).concat(searchParams.id as any).join(','));
            }
            if(!!searchParams.devices && searchParams.devices.length > 0) {
                params = params.set('devices', searchParams.devices.join(','));
            }
        }
        return this.http.get<GroupType[]>(`${this.baseUrl}/groups`, {params});
    }

    newGroup(data: GroupType): Observable<{status: string; data: GroupType; note: string}> {
        let url = `${this.baseUrl}/group`;
        return this.http.post<{status: string; data: GroupType; note: string}>(url, data);
    }

    editGroup(data: GroupType): Observable<GroupType> {
        let url = `${this.baseUrl}/group/${ data.id }`;
        return this.http.put<GroupType>(url, data);
    }


    deleteGroups(groups: GroupType[]): Observable<{status: string; data: any; note: string}> {
        let url = `${this.baseUrl}/groups?ids=${ groups.map((group: GroupType) => group.id).join(',') }`;
        return this.http.delete<{status: string; data: any; note: string}>(url);
    }


}
