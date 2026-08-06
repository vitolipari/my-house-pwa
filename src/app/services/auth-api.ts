import {Injectable, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {from, Observable, switchMap} from 'rxjs';
import {
    ConfirmRequest, EditProfileRequestType,
    LoggedUser,
    LoginRequest,
    LoginResponse,
    SignUpRequest
} from '../models/auth.models';
import {ApiUrlService} from './api-url-service';
import {AuthService} from './auth';

@Injectable({
    providedIn: 'root'
})
export class AuthApiService {
    private readonly http = inject(HttpClient);
    // authService = inject(AuthService);
    baseUrl = '';
    profileUrl = '/profile';



    login(payload: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`/profile/signin`, payload);
    }

    signUp(payload: SignUpRequest): Observable<void> {
        return this.http.post<void>(`/profile/signup`, payload);
    }

    me(): Observable<{ profile: LoggedUser; accessToken: string; }> {
        return this.http.get<{ profile: LoggedUser; accessToken: string; }>('/profile/me');
    }

    // logout(): void {
    //     // return this.http.post<void>(`/profile/logout`, {});
    //     this.authService.clearLoginData();
    //     return;
    // }
    editProfile(payload: EditProfileRequestType): Observable<LoggedUser> {
        return this.http.put<LoggedUser>(`/profile/${ payload.id }`, payload);
    }
}
