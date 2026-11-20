import {Component, inject, signal} from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {SwUpdateService} from './services/sw-update';
import {DarkModeService} from './services/dark-mode-service';
import {SvgSprite} from './ui/svg-sprite/svg-sprite';
import {Header} from './components/header/header';
import {AuthService} from './services/auth';
import {filter} from 'rxjs/operators';
import { DrawerModule } from 'primeng/drawer';
import {MobileMenuComponent} from './components/menu-component/mobile-menu.component';
import {PwaInstallService} from './services/pwa-install';
import {coreOffline} from './interceptor/offline-cache.interceptor';
import {SidebarMenu} from './components/sidebar-menu/sidebar-menu';
import {DeviceApiService} from './pages/devices/device-api';
import {firstValueFrom} from 'rxjs';


// trascinamento verso il basso, in pixel, oltre il quale la pagina si ricarica
const PULL_TO_REFRESH_DISTANCE = 150;


@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, SvgSprite, Header, DrawerModule, MobileMenuComponent, SidebarMenu],
    templateUrl: `./app.html`,
    styleUrl: './app.css',
})
export class App {

    protected readonly title = signal('my-house-pwa');

    authService = inject(AuthService);
    readonly user = this.authService.currentUser;
    dc: any;
    // user = this.authService.currentUser;

    private readonly swUpdateService = inject<SwUpdateService>(SwUpdateService);
    private readonly pwaInstallService = inject(PwaInstallService);
    readonly availableUpdate = this.swUpdateService.availableUpdate;
    readonly secondsUntilReload = this.swUpdateService.secondsUntilReload;
    readonly canInstallPwa = this.pwaInstallService.canInstall;
    readonly coreOffline = coreOffline;
    darkModeService = inject(DarkModeService);

    // user: LoggedUser | null;

    // getComputedStyle(document.body).getPropertyValue("--sky-color");

    private router = inject(Router);
    private readonly deviceApi = inject(DeviceApiService);

    readonly isInProfilePage = signal(false);


    drawerVisible = false;

    constructor() {
        this.swUpdateService.init();
        this.pwaInstallService.init();

        // a ogni avvio e a ogni refresh (anche trascinando verso il basso, che ricarica la pagina) il Core ricontrolla
        // MAC e IP dei dispositivi; la pagina non aspetta la risposta. Senza accesso la rotta risponderebbe 401
        if( this.authService.isAuthenticated() ) {
            firstValueFrom(this.deviceApi.refreshMacIp())
                .then((result: unknown) => result)
                .catch((error: any) => {
                    console.log('errore nel costruttore di App: controllo di MAC e IP dei dispositivi');
                    console.log(error);
                    return null;
                })
            ;
        }

        console.log('chiamo il getLoggedUser');
        // this.user = this.authService.currentUser;

        console.log('controllo user');
        console.log( this.user );
        // this.isDarkTheme = this.darkModeService.readIsDarkTheme();
        // this.darkModeService.setTheme(this.darkModeService.readIsDarkTheme());
        // this.darkModeService.init();


        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                this.isInProfilePage.set(
                    event.urlAfterRedirects.startsWith('/profile')
                );
            });


        // trascinando verso il basso con la pagina in cima si ricarica, come nel browser:
        // l'app installata (display standalone) non ha il pull-to-refresh del telefono
        let pullStartY: number = -1;

        document.addEventListener('touchstart', (event: TouchEvent) => {
            pullStartY = -1;

            if( window.scrollY > 0 ) {
                return;
            }

            // niente ricarica dentro un elenco già scorso o su un controllo che si trascina (slider, ruota del timer)
            let element: Element | null = event.target as Element;
            while( !!element && element !== document.body ) {
                if( element.scrollTop > 0 || getComputedStyle(element).touchAction === 'none' ) {
                    return;
                }
                element = element.parentElement;
            }

            pullStartY = event.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', (event: TouchEvent) => {
            if( pullStartY < 0 ) {
                return;
            }

            if( (event.changedTouches[0].clientY - pullStartY) > PULL_TO_REFRESH_DISTANCE ) {
                window.location.reload();
            }

            pullStartY = -1;
        }, { passive: true });



    }

    installPwa(): void {
        void this.pwaInstallService.install();
    }

}
