import {Component, computed, EventEmitter, inject, Input, Output} from '@angular/core';
import {JsonPipe} from '@angular/common';
import {LoggedUser} from '../../models/auth.models';
import {Router} from '@angular/router';
import {emoj} from '../../utils/string-utils';
import {PermissionService} from '../../services/permission.service';
import {DarkModeService} from '../../services/dark-mode-service';


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
    private readonly darkModeService = inject(DarkModeService);

    readonly lipariStudiosImage = computed(() =>
        this.darkModeService.isDarkMode()
            ? 'assets/images/LipariStudios_06_white.png'
            : 'assets/images/LipariStudios_06_black.png'
    );


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
