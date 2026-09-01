import {Component, inject} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AccessControlData} from '../../models/access-control.models';
import {DeviceType} from '../devices/devices.models';

@Component({
    selector: 'app-device-details.page',
    imports: [],
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

    constructor() {
        // controllo se device é stato passato oppure si proviene da url
        if( !this.device ) {
            // TODO chiamata a /api/core/device/:id
            // id vale deviceID
        }

    }


}
