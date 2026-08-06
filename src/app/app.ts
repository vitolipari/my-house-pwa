import {Component, effect, inject, signal} from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {SwUpdateService} from './services/sw-update';
import {DarkModeService} from './services/dark-mode-service';
import {SvgSprite} from './ui/svg-sprite/svg-sprite';
import {Header} from './components/header/header';
import {AuthService} from './services/auth';
import {LoggedUser} from './models/auth.models';
import {JsonPipe} from '@angular/common';
import {filter} from 'rxjs/operators';
import { DrawerModule } from 'primeng/drawer';
import {MobileMenuComponent} from './components/menu-component/mobile-menu.component';


@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, SvgSprite, Header, JsonPipe, DrawerModule, MobileMenuComponent],
    templateUrl: `./app.html`,
    styleUrl: './app.css',
})
export class App {

    protected readonly title = signal('my-house-pwa');

    authService = inject(AuthService);
    readonly user = this.authService.currentUser;
    // user = this.authService.currentUser;

    private readonly swUpdateService = inject<SwUpdateService>(SwUpdateService);
    darkModeService = inject(DarkModeService);

    // user: LoggedUser | null;

    // getComputedStyle(document.body).getPropertyValue("--sky-color");

    private router = inject(Router);

    readonly isInProfilePage = signal(false);


    drawerVisible = false;

    constructor() {
        this.swUpdateService.init();

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


    }


}
