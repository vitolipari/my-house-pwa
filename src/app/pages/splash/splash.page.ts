import {Component, effect, inject, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth';
import packageJson from '../../../../package.json';
import {DarkModeService} from '../../services/dark-mode-service';
import {LoggedUser} from '../../models/auth.models';

const SPLASH_SCREEN_TIME = 500;

@Component({
    selector: 'app-splash',
    standalone: true,
    templateUrl: './splash.page.html',
    styleUrls: ['./splash.page.css']
})
export class SplashPage implements OnInit {

    private router = inject(Router);
    private authService = inject(AuthService);
    protected readonly darkModeService = inject(DarkModeService);

    version: string = packageJson.version;

    constructor() {
        effect(() => {
            const isDark = this.darkModeService.isDarkMode();

            console.log('Dark mode cambiata:', isDark);
        });
    }

    ngOnInit() {

        // caricamento dati iniziali
        const leaveSplashScreen = new Promise<any>((onFinish, onError) => {
            try {
                setTimeout(() => {

                    Promise.all([
                        this.authService.ensureUserLoaded()

                    ])
                        .then((data: any[]) => {
                            onFinish(data);
                        })
                        .catch((e: any) => {
                            console.log('errore a leaveSplashScreen');
                            console.log(e);
                            onError(e);
                        })

                }, SPLASH_SCREEN_TIME);
            } catch (e) {
                onError(e);
            }
        });


        leaveSplashScreen
            .then((data: any) => {

                console.log('fine splash screen');

                if (this.authService.isAuthenticated()) {
                    console.log('vado a dashboard');
                    this.router.navigate(['/dashboard']);
                } else {
                    console.log('vado a signin');
                    this.router.navigate(['/access/sign-in']);
                }

            })
            .catch((e: any) => {
                console.log('errore');
                console.log(e.message);
                console.log(e);
                console.error(e);

                if( e === 'no-token' ) {
                    this.authService.clearLoginData();
                    this.router.navigate(['/access/sign-in']);
                }
                else {

                    if( e === 'user by token NON esistente!!' ) {
                        this.authService.clearLoginData();
                        this.router.navigate(['/access/sign-in']);
                    }
                    else {
                        this.router.navigate(
                            ['/error'],
                            {
                                state: {
                                    code: 'SPLASH_INIT_ERROR',
                                    message: e?.message || 'Errore durante inizializzazione',
                                    details: e
                                }
                            }
                        );
                    }


                }

            })

    }

}
