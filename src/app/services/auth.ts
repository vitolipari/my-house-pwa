import {Injectable, computed, inject, signal} from '@angular/core';
import {firstValueFrom, Observable} from 'rxjs';
import {AuthApiService} from './auth-api';
import {
    ConfirmRequest, EditProfileRequestType,
    LoggedUser,
    LoginRequest,
    SignUpRequest
} from '../models/auth.models';
import {clearOfflineCache} from '../interceptor/offline-cache.interceptor';

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
                    this.saveLoggedUser( result.profile );
                    this.saveToken( result.accessToken );
                    return result;
                })
                .catch((e: any) => {
                    console.log('errore in login');
                    console.log(e);
                    return Promise.reject(e);
                })
        );

    }

    signUp(payload: SignUpRequest): Promise<void> {
        return (
            firstValueFrom(this.authApi.signUp(payload))
                .then((result: any) => {
                    return result;
                })
                .catch((e: any) => {
                    console.log('errore in signUp');
                    console.log(e);
                    return Promise.reject(e);
                })
        );
    }

    // il profilo riletto dal Core diventa l'utente corrente, così form e anteprima restano allineati
    editProfile(payload: EditProfileRequestType): Promise<LoggedUser> {
        return (
            firstValueFrom(this.authApi.editProfile(payload))
                .then(updatedUser => {
                    this.currentUser.set(updatedUser);
                    return updatedUser;
                })
        );
    }

    // confirm(payload: ConfirmRequest): Promise<void> {
    //     return firstValueFrom(this.authApi.confirm(payload)).then(() => undefined);
    // }

    // forgotPassword(email: string): Promise<void> {
    //     return firstValueFrom(this.authApi.forgotPassword(email)).then(() => undefined);
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
            this.clearLoginData();
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

    }

    /**
     * Revoca il token sul server, poi cancella i dati locali anche se la revoca
     * fallisce: l'utente deve comunque risultare disconnesso.
     */
    logout(): Promise<void> {
        if (!this.hasToken()) {
            this.clearLoginData();
            return Promise.resolve();
        }
        return (
            firstValueFrom(this.authApi.signOut())
                .then(() => undefined)
                .catch((e: any) => {
                    console.log('errore in logout: revoca del token sul server');
                    console.log(e);
                })
                .then(() => this.clearLoginData())
        );
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
        clearOfflineCache();
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
