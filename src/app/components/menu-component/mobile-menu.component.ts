import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {JsonPipe} from '@angular/common';
import {LoggedUser} from '../../models/auth.models';
import {Router} from '@angular/router';

@Component({
    selector: 'mobile-menu',
    imports: [
        JsonPipe
    ],
    templateUrl: './mobile-menu.component.html',
    styleUrl: './mobile-menu.component.css',
    standalone: true
})
export class MobileMenuComponent {

    private router = inject(Router);
    @Input() user!: LoggedUser | null;
    @Output() menuClose = new EventEmitter<void>();


    hasPermission(permission: string) {
        return this.user?.permissions.includes( permission );
    }

    gotoPage(path: string) {

        // TODO chiudere questa pagina tramite un emit
        this.menuClose.emit();


        this.router.navigate(
            [path],
            {
                state: {
                    from: 'mobileMenu'
                }
            }
        );
    }
}
