import {Component, inject, OnInit} from '@angular/core';
import {PageTitleComponent} from '../../components/page-title.component/page-title.component';
import {ActivatedRoute, Router} from '@angular/router';
import {DeviceType} from '../devices/devices.models';
import {PermissionService} from '../../services/permission.service';

@Component({
  selector: 'app-room.page',
    imports: [
        PageTitleComponent
    ],
  templateUrl: './room.page.html',
  styleUrl: './room.page.css',
})
export class RoomPage implements OnInit {

    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly permissionService = inject(PermissionService);

    readonly routeInfo = this.route.snapshot.data; // oggetto data della rotta = accessControl.permission
    readonly pathVariables = this.route.snapshot.params; // oggetto con i pathVariables
    readonly routeParamater = this.route.snapshot.queryParams; // oggetto con la query string
    readonly navigationData = this.router.currentNavigation()?.extras.state;    // passato dalla navigazione

    constructor() {
        console.log('RoomPage constructor');

    }

    ngOnInit(): void {


        // TODO
        if( !this.permissionService.hasPermission(this.routeInfo["accessControl"].permission) ) {
            // per qualche strano motivo questo componente é stato instanziato senza permesso
        }

        // TODO
        if( !this.navigationData ) {
            // bisogna caricare i dati della stanza
            // perché non sono arrivati dalla navigazione interna
        }

    }

}
