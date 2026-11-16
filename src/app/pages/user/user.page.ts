import {Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {firstValueFrom} from 'rxjs';
import {ProfileType, VOID_USER} from './profile.models';
import {ApiUrlService} from '../../services/api-url-service';
import {DatePipe} from '@angular/common';
import {PermissionService, RolePermissionType} from '../../services/permission.service';
import {Button} from 'primeng/button';
import {Drawer} from 'primeng/drawer';
import {Checkbox, CheckboxChangeEvent} from 'primeng/checkbox';
import {FormsModule} from '@angular/forms';
import {PermissionType} from '../profile/permission.models';
import moment from 'moment';


export const ROLE_ICON: { [role: string]: string } = {
    MASTER: 'marker-a',
    OWNER: 'icon-298',  // 'icon-64'
    FAMILY: 'spunta',
    FRIEND: 'utenti-icon-2',
    HOST: 'asterisco',
    VISITOR: 'icon-374',
    UNKNOWN: 'icon-465'
}




@Component({
  selector: 'user.page',
    imports: [
        DatePipe,
        Button,
        Drawer,
        Checkbox,
        FormsModule
    ],
  templateUrl: './user.page.html',
  styleUrl: './user.page.css',
})
export class UserPage implements OnInit {

    protected user = signal<ProfileType>(VOID_USER);
    protected readonly userWaiting = signal<boolean>(true);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly userApi = inject<ApiUrlService>(ApiUrlService);
    private readonly permissionService = inject(PermissionService);
    protected openDrawer: boolean = false;
    protected readonly isLoadPermissionInWait = signal<boolean>(false);
    protected readonly ROLE_ICON = ROLE_ICON;
    allRoles: RolePermissionType[] = [];
    private selectedRoles: RolePermissionType[] = [];

    constructor() {

        if(!!this.user().id) {
            // user presente
            console.log('utente in variabile');
            console.log(this.user());
            this.userWaiting.set(false);
        }
        else {

            console.log('dati di navigazione passati');
            console.log(this.router.currentNavigation()?.extras);
            console.log(this.router.currentNavigation()?.extras.state);
            console.log(this.router.currentNavigation()?.extras.state?.['user']);

            if ( !!this.router.currentNavigation()?.extras.state?.['user'] ) {
                console.log('utente passato da navigazione');
                // user passato da navigazione
                this.user.set( this.router.currentNavigation()?.extras.state?.['user'] as ProfileType );


                console.log(this.user());
                this.userWaiting.set(false);
            }
            else {
                // user non passato da navigazione

                if( !!this.route.snapshot.params['id'] ) {
                    console.log('utente da caricare');

                    firstValueFrom(this.userApi.getUsers())
                        .then((users: ProfileType[]) => {
                            this.user.set( users.find((currentUser: ProfileType) => currentUser.id === parseInt(''+ this.route.snapshot.params['id'])) || VOID_USER);
                            console.log(this.user());
                            this.userWaiting.set(false);
                        })

                }
                else {
                    // anomalia
                    console.log('anomalia in user page');
                }

            }
        }

    }


    ngOnInit(): void {
    }


    hasPermission(permission: string): boolean {
        return this.permissionService.hasPermission(permission);
    }


    /*
    protected openPermissionDrawer() {
        this.openDrawer = true;
        this.isLoadPermissionInWait.set( true );

        firstValueFrom(this.permissionService.getAllPermissions())
            .then((permissions: {name: string; description: string;}[]) => {

                console.log('permissions');
                console.log(permissions);

                this.allRoles = permissions;
                this.isLoadPermissionInWait.set( false );

            })

    }
    */


    protected openPermissionDrawer() {
        this.openDrawer = true;
        this.isLoadPermissionInWait.set( true );

        firstValueFrom(this.permissionService.getAllRoles())
            .then((permissions: RolePermissionType[]) => {

                console.log('roles');
                console.log(permissions);
                /*
                [
                  {
                    "name": "MASTER",
                    "description": "Utente principale",
                    "permissions": [
                      {
                        "name": "ACCESS_DASHBOARD",
                        "description": "accesso alla dashboard"
                      },
                      ...
                    ]
                  },
                  ...
                ]
                 */

                this.allRoles = permissions.filter((r: RolePermissionType) => r.name !== 'MASTER');

                // si riparte dai ruoli dell'utente a ogni apertura del drawer
                this.selectedRoles = [];
                (this.user().roles as string[])
                    .forEach((r: string) => {
                        if( this.allRoles.map((role: RolePermissionType) => role.name).includes( r ) ) {
                            let roleToAdd = this.allRoles.find((rr: RolePermissionType) => rr.name === r);
                            if(!!roleToAdd) {
                                this.selectedRoles.push( roleToAdd );
                            }
                        }
                    })
                ;

                this.isLoadPermissionInWait.set( false );

            })
            .catch((e: any) => {
                console.log('errore in openPermissionDrawer: lettura dei ruoli');
                console.log(e);
                this.isLoadPermissionInWait.set( false );
                this.openDrawer = false;
            })

    }

    protected toggleSelctedRow(role: RolePermissionType, event: CheckboxChangeEvent) {

        if( role.name === 'MASTER' ) {
            alert('ATTENZIONE non puoi assegnare un ruolo MASTER');
            return;
        }

        this.selectedRoles =
            this.selectedRoles.filter((selected: RolePermissionType) => selected.name !== role.name);
        if (!!event.checked) {
            this.selectedRoles.push(role);
        }

    }

    protected isSelectedRoles(role: RolePermissionType) {
        return !!this.selectedRoles.find((sr: RolePermissionType) => sr.name === role.name);
    }

    protected saveNewUserRole() {
        this.isLoadPermissionInWait.set( true );
        console.log(this.selectedRoles);
        firstValueFrom(this.permissionService.editUserRole( this.user(), this.selectedRoles))
            .then((result: any) => {
                this.isLoadPermissionInWait.set( false );
                window.location.href = window.location.href;
            })
            .catch((e: any) => {
                console.log('errore in saveNewUserRole: salvataggio dei ruoli');
                console.log(e);
                this.isLoadPermissionInWait.set( false );
                alert(e?.error?.note || 'salvataggio dei ruoli non riuscito');
            })
    }


    protected permissionDate(perm: string) {
        return moment( perm.split('@')[1], 'YYYYMMDD' ).format('DD MMM YYYY');
    }
}
