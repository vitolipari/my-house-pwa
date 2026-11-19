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
                            console.log('errore in ngOnInit: leaveSplashScreen');
                            console.log(e);
                            onError(e);
                        })

                }, SPLASH_SCREEN_TIME);
            } catch (e) {
                console.log('errore sincrono in ngOnInit');
                console.log(e);
                onError(e);
            }
        });


        leaveSplashScreen
            .then((data: any) => {

                console.log('fine splash screen');

                // replaceUrl: la splash non resta nella cronologia, così lo swipe indietro non ci torna
                if (this.authService.isAuthenticated()) {
                    console.log('vado a dashboard');
                    this.router.navigate(['/dashboard'], { replaceUrl: true });
                } else {
                    console.log('vado a signin');
                    this.router.navigate(['/access/sign-in'], { replaceUrl: true });
                }

            })
            .catch((e: any) => {
                console.log('errore in ngOnInit: caricamento iniziale');
                console.log(e);

                if( e === 'no-token' ) {
                    this.authService.clearLoginData();
                    this.router.navigate(['/access/sign-in'], { replaceUrl: true });
                }
                else {

                    if( e === 'user by token NON esistente!!' ) {
                        this.authService.clearLoginData();
                        this.router.navigate(['/access/sign-in'], { replaceUrl: true });
                    }
                    else {
                        this.router.navigate(
                            ['/error'],
                            {
                                replaceUrl: true,
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
