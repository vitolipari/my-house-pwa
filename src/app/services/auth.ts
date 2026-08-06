import {Injectable, computed, inject, signal} from '@angular/core';
import {firstValueFrom, Observable} from 'rxjs';
import {AuthApiService} from './auth-api';
import {
    ConfirmRequest, EditProfileRequestType,
    LoggedUser,
    LoginRequest,
    SignUpRequest
} from '../models/auth.models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly authApi = inject<AuthApiService>(AuthApiService);

    private readonly tokenKey = 'auth_token';
    private readonly userKey = 'logged_user';
    private readonly temporaryLinkKey = 'temporary_link_context';



    readonly currentUser = signal<LoggedUser | null>(null);
    readonly isAuthenticated = computed(() => !!this.currentUser || this.hasToken());

    login(payload: LoginRequest): Promise<LoggedUser> {

        return (
            firstValueFrom(this.authApi.login(payload))
                .then((result: any) => {
                    console.log('risposta login');
                    console.log(result);
                    // debugger;
                    this.saveLoggedUser( result.profile );
                    this.saveToken( result.accessToken );
                    return result;
                })
                .catch((e: any) => {
                    console.log('errore al signUp di auth')
                    console.log(e);
                    debugger;
                    return Promise.reject(e);
                })
        );


        // const response = await firstValueFrom(this.authApi.login(payload));
        // this.saveToken(response.accessToken);
        // return await this.loadCurrentUser();
    }

    signUp(payload: SignUpRequest): Promise<void> {
        return (
            firstValueFrom(this.authApi.signUp(payload))
                .then((result: any) => {
                    return result;
                })
                .catch((e: any) => {
                    console.log('errore al signUp di auth')
                    console.log(e);
                    debugger;
                    return Promise.reject(e);
                })
        );
    }

    async editProfile(payload: EditProfileRequestType): Promise<LoggedUser> {
        const updatedUser = await firstValueFrom(
            this.authApi.editProfile(payload)
        );

        this.currentUser.set(updatedUser);

        return updatedUser;
    }

    // async confirm(payload: ConfirmRequest): Promise<void> {
    //     await firstValueFrom(this.authApi.confirm(payload));
    // }

    // async forgotPassword(email: string): Promise<void> {
    //     await firstValueFrom(this.authApi.forgotPassword(email));
    // }

    // loadCurrentUser(): Promise<LoggedUser> {
    //     return this.ensureUserLoaded();
    // }

    ensureUserLoaded(): Promise<LoggedUser> {
        // const current = this.currentUser;
        console.log('authService controllo il token e l\'utente');
        console.log(this.getToken(), this.currentUser());

        if (!this.hasToken()) {
            console.log('manca il token in authService.ensureUserLoaded()');
            return Promise.reject('no-token');
        }

        if (!!this.currentUser()) {
            return Promise.resolve(this.currentUser()!);
        }
        else {

            console.log('vado a recuperare l\'utente dalla chiamata me in authService');
            return (
                firstValueFrom(this.authApi.me())
                    .then((user) => {
                        if (user?.profile?.id) {
                            this.currentUser.set(user.profile);
                            return user.profile;
                        }
                        return Promise.reject('no-user');
                    })
                );

        }



        // try {
        //     return await this.loadCurrentUser();
        // } catch {
        //     this.clearLoginData();
        //     return null;
        // }
    }

    async logout(): Promise<void> {
        this.clearLoginData();
    }

    saveToken(token: string): void {
        localStorage.setItem(this.tokenKey, token);
    }

    getToken(): string | null | undefined {

        console.log(`letto da localstorage ${ this.tokenKey }`);

        return localStorage.getItem(this.tokenKey);
    }

    hasToken(): boolean {
        return !!this.getToken(); // ✅ FIX typo
    }

    saveLoggedUser(user: LoggedUser): void {


        // localStorage.setItem(this.userKey, JSON.stringify(user));
        this.currentUser.set(user);
    }

    getLoggedUser(): LoggedUser | null {

        return this.currentUser();
    }

    // storeTemporaryLinkContext(tempToken: string): void {
    //     sessionStorage.setItem(this.temporaryLinkKey, tempToken);
    // }
    //
    // getTemporaryLinkContext(): string | null {
    //     return sessionStorage.getItem(this.temporaryLinkKey);
    // }
    //
    // clearTemporaryLinkContext(): void {
    //     sessionStorage.removeItem(this.temporaryLinkKey);
    // }

    clearLoginData(): void {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        // this.clearTemporaryLinkContext();
        this.currentUser.set(null);
    }

    // private readUserFromStorage(): LoggedUser | null {
    //     const raw = localStorage.getItem(this.userKey);
    //
    //     console.log(`letto da localstorage ${ this.userKey }`);
    //     console.log( raw );
    //
    //     if (!raw) return null;
    //
    //     try {
    //         return JSON.parse(raw) as LoggedUser;
    //     } catch {
    //         return null;
    //     }
    // }
}
