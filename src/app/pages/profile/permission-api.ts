import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {DelegationType, GrantRequestType, PermissionType} from './permission.models';

/*
Dal CORE
app.get(    '/permissions',                         requirePermission(['ACCESS_PROFILE_PAGE']),     searchPermissionsRequest    )
app.post(   '/user/:id/grant-permission-request',   requirePermission(['ACCESS_PROFILE_PAGE']),     createGrantRequestRequest   )
app.get(    '/grant-permission-requests',           requirePermission(['GIVE_AUTHORIZATIONS']),     searchGrantRequestsRequest  )
app.put(    '/grant-permission-request/:requestID', requirePermission(['GIVE_AUTHORIZATIONS']),     confirmGrantRequestRequest  )
app.post(   '/user/:id/delegate-permission',        requirePermission(['GIVE_AUTHORIZATIONS']),     createDelegationRequest     )
app.put(    '/delegate-permission/:delegationID',   requirePermission([]),                          acquireDelegationRequest    )
 */

@Injectable({providedIn: 'root'})
export class PermissionApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = '/api/core';


    // catalogo dei permessi, per il drawer «Richiedi permesso»
    searchPermissions(): Observable<PermissionType[]> {
        return this.http.get<PermissionType[]>(`${this.baseUrl}/permissions`);
    }

    // richiesta di permessi per l'utente: exp è AAAA-MM-GG, la risposta porta il requestID del QR
    requestPermissions(userID: number, permissions: string[], exp: string): Observable<{ requestID: number; }> {
        return this.http.post<{ requestID: number; }>(`${this.baseUrl}/user/${userID}/grant-permission-request`, {permissions, exp});
    }

    // la richiesta del QR, per la pagina dell'autorizzatore: la ricerca restituisce una lista
    searchGrantRequests(requestID: number): Observable<GrantRequestType[]> {
        let params: HttpParams = new HttpParams().set('id', requestID);
        return this.http.get<GrantRequestType[]>(`${this.baseUrl}/grant-permission-requests`, {params});
    }

    // conferma della richiesta: il Core concede solo i permessi che ha anche l'autorizzatore
    confirmGrantRequest(requestID: number): Observable<GrantRequestType> {
        return this.http.put<GrantRequestType>(`${this.baseUrl}/grant-permission-request/${requestID}`, {});
    }

    // concessione di permessi dell'utente: exp è AAAA-MM-GG, la risposta porta il delegationID del QR
    delegatePermissions(userID: number, permissions: string[], exp: string): Observable<{ delegationID: number; }> {
        return this.http.post<{ delegationID: number; }>(`${this.baseUrl}/user/${userID}/delegate-permission`, {permissions, exp});
    }

    // ricezione della concessione del QR: il Core scrive il ricevente e restituisce i permessi ricevuti
    acquireDelegation(delegationID: number): Observable<DelegationType> {
        return this.http.put<DelegationType>(`${this.baseUrl}/delegate-permission/${delegationID}`, {});
    }

}
