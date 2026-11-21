import {Component, computed, EventEmitter, inject, Input, Output} from '@angular/core';
import {Router} from '@angular/router';
import {LoggedUser} from '../../models/auth.models';
import {emoj} from '../../utils/string-utils';
import {PermissionService} from '../../services/permission.service';
import {DarkModeService} from '../../services/dark-mode-service';

@Component({
  selector: 'app-credentials.page',
  imports: [],
  templateUrl: './credentials.page.html',
  styleUrl: './credentials.page.css',
})
export class CredentialsPage {

    protected router = inject(Router);
    coffe: string = emoj('hot_beverage');
    private readonly permissionService = inject(PermissionService);
    private readonly darkModeService = inject(DarkModeService);

    readonly lipariStudiosImage = computed(() =>
        this.darkModeService.isDarkMode()
            ? 'assets/images/LipariStudios_06_white.png'
            : 'assets/images/LipariStudios_06_black.png'
    );

}
