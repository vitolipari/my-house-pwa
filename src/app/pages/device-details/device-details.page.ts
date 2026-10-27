import {Component, inject, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AccessControlData} from '../../models/access-control.models';
import {DeviceType} from '../devices/devices.models';
import {JsonPipe} from '@angular/common';
import {Drawer} from 'primeng/drawer';
import {PageTitleComponent} from '../../components/page-title.component/page-title.component';

@Component({
    selector: 'app-device-details.page',
    imports: [
        JsonPipe,
        Drawer,
        PageTitleComponent
    ],
    templateUrl: './device-details.page.html',
    styleUrl: './device-details.page.css',
    standalone: true
})
export class DeviceDetailsPage {



    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);

    readonly data = this.router.currentNavigation()?.extras.state as { from: string; device?: DeviceType; } | undefined;
    readonly device = this.data?.device;
    readonly deviceId = this.route.snapshot.paramMap.get('id');
    protected openConfirmDeletion: boolean = false;
    protected readonly isInDeleteDeviceInWaiting = signal<boolean>(false);

    constructor() {
        // controllo se device é stato passato oppure si proviene da url
        if( !this.device ) {
            // TODO chiamata a /api/core/device/:id
            // id vale deviceID
        }

    }


    protected confirmDeleteDevice() {
        return null;
    }


}
