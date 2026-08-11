import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {JsonPipe} from '@angular/common';
import {LoggedUser} from '../../models/auth.models';
import {Router} from '@angular/router';
import {emoj} from '../../utils/string-utils';
import {PermissionService} from '../../services/permission.service';


@Component({
    selector: 'mobile-menu',
    imports: [
        JsonPipe
    ],
    templateUrl: './mobile-menu.component.html',
    styleUrls: [
        // '../header/header.css',
        './mobile-menu.component.css'
    ],
    standalone: true
})
export class MobileMenuComponent {

    private router = inject(Router);
    @Input() user!: LoggedUser | null;
    // @Input() isInProfilePage: boolean = false;
    @Output() menuClose = new EventEmitter<void>();
    coffe: string = emoj('hot_beverage');
    private readonly permissionService = inject(PermissionService);


    hasPermission(permission: string) {
        return this.permissionService.hasPermission(permission);
    }

    gotoPage(path: string) {

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
