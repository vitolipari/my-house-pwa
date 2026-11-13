import {Component, computed, EventEmitter, inject, Input, Output} from '@angular/core';
import {Router} from '@angular/router';
import {LoggedUser} from '../../models/auth.models';
import {emoj} from '../../utils/string-utils';
import {PermissionService} from '../../services/permission.service';
import {DarkModeService} from '../../services/dark-mode-service';

@Component({
  selector: 'sidebar-menu',
  imports: [],
  templateUrl: './sidebar-menu.html',
  styleUrl: './sidebar-menu.css',
})
export class SidebarMenu {

    protected router = inject(Router);
    @Input() user!: LoggedUser | null;
    @Output() menuClose = new EventEmitter<void>();
    coffe: string = emoj('hot_beverage');
    private readonly permissionService = inject(PermissionService);
    private readonly darkModeService = inject(DarkModeService);
    // currentSection: string = '/';

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

        // this.currentSection = path;

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
