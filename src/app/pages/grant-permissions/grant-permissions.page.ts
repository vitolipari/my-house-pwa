import {CommonModule} from '@angular/common';
import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {firstValueFrom} from 'rxjs';
import {Button} from 'primeng/button';
import moment from 'moment';
import {PageTitleComponent} from '../../components/page-title.component/page-title.component';
import {PermissionService} from '../../services/permission.service';
import {getLastElementOr} from '../../utils/array-util';
import {PermissionApiService} from '../profile/permission-api';
import {GrantRequestType, PermissionType} from '../profile/permission.models';

// Pagina aperta dal QR di una richiesta di permessi: chi ha GIVE_AUTHORIZATIONS vede chi chiede quali
// permessi e fino a quando, poi conferma o nega. «Nega» non chiama il Core (decisione di Vito del 13/11)
@Component({
    selector: 'grant-permissions-page',
    standalone: true,
    imports: [CommonModule, PageTitleComponent, Button],
    templateUrl: './grant-permissions.page.html',
    styleUrls: ['../../../page.css', './grant-permissions.page.css']
})
export class GrantPermissionsPage implements OnInit {

    private readonly permissionApi = inject(PermissionApiService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    // pubblico perché il template marca i permessi che l'autorizzatore non ha
    readonly permissionService = inject(PermissionService);

    readonly requestID: number = parseInt(''+ this.route.snapshot.paramMap.get('requestID'));

    readonly request = signal<GrantRequestType | null>(null);
    readonly loading = signal<boolean>(true);
    readonly inWaiting = signal<boolean>(false);
    // messaggio che blocca i bottoni: richiesta assente, già confermata, scaduta, oppure concessi
    readonly message = signal<string>('');
    readonly errorMessage = signal<string>('');

    // senza nemmeno un permesso richiesto fra i propri il Core rifiuta la conferma
    readonly canConfirm = computed<boolean>(() => (
        (this.request()?.permissions ?? [])
            .some((permission: PermissionType) => this.permissionService.hasPermission(permission.name))
    ));


    ngOnInit(): void {

        this.inWaiting.set(true);

        firstValueFrom(this.permissionApi.searchGrantRequests(this.requestID))
            .then((grantRequests: GrantRequestType[]) => {

                let grantRequest: GrantRequestType | null = grantRequests.reduce(getLastElementOr, null);

                this.request.set(grantRequest);

                if( !grantRequest ) {
                    this.message.set('richiesta non trovata');
                }
                else if( grantRequest.confirmedPermissions.length > 0 ) {
                    this.message.set('richiesta già confermata');
                }
                else if( moment(grantRequest.exp, 'YYYY-MM-DD').isBefore(moment(), 'day') ) {
                    this.message.set('richiesta scaduta');
                }

                this.loading.set(false);
                this.inWaiting.set(false);
            })
            .catch((e: any) => {
                console.log('errore in ngOnInit di GrantPermissionsPage: lettura della richiesta di permessi');
                console.log(e);
                this.errorMessage.set(e?.note || 'lettura della richiesta non riuscita');
                this.loading.set(false);
                this.inWaiting.set(false);
            })
        ;
    }


    // conferma: il Core concede solo i permessi richiesti che l'autorizzatore ha anche lui
    confirm(): void {

        this.inWaiting.set(true);
        this.errorMessage.set('');

        firstValueFrom(this.permissionApi.confirmGrantRequest(this.requestID))
            .then((confirmed: GrantRequestType) => {
                this.request.set(confirmed);
                this.message.set('permessi concessi: ' + confirmed.confirmedPermissions.join(', '));
                this.inWaiting.set(false);
            })
            .catch((e: any) => {
                console.log('errore in confirm di GrantPermissionsPage: conferma della richiesta di permessi');
                console.log(e);
                this.errorMessage.set(e?.note || 'conferma non riuscita');
                this.inWaiting.set(false);
            })
        ;
    }


    // nessuna scrittura sul Core: la richiesta resta com'è e si torna alla dashboard
    deny(): void {
        this.router.navigate(['/dashboard']);
    }
}
