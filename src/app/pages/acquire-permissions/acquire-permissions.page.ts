import {CommonModule} from '@angular/common';
import {Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {firstValueFrom} from 'rxjs';
import {Button} from 'primeng/button';
import {PageTitleComponent} from '../../components/page-title.component/page-title.component';
import {LoggedUser} from '../../models/auth.models';
import {AuthService} from '../../services/auth';
import {PermissionApiService} from '../profile/permission-api';
import {DelegationType} from '../profile/permission.models';

// Pagina aperta dal QR di una concessione: la ricezione si conferma all'apertura e il ricevente è uno
// solo (decisione di Vito del 13/11); lo stesso ricevente che riapre il link rilegge i permessi
@Component({
    selector: 'acquire-permissions-page',
    standalone: true,
    imports: [CommonModule, PageTitleComponent, Button],
    templateUrl: './acquire-permissions.page.html',
    styleUrls: ['../../../page.css', './acquire-permissions.page.css']
})
export class AcquirePermissionsPage implements OnInit {

    private readonly permissionApi = inject(PermissionApiService);
    private readonly authService = inject(AuthService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    readonly delegationID: number = parseInt(''+ this.route.snapshot.paramMap.get('delegationID'));

    readonly delegation = signal<DelegationType | null>(null);
    readonly loading = signal<boolean>(true);
    readonly inWaiting = signal<boolean>(false);
    readonly errorMessage = signal<string>('');


    ngOnInit(): void {

        this.inWaiting.set(true);

        firstValueFrom(this.permissionApi.acquireDelegation(this.delegationID))
            .then((received: DelegationType) => {

                this.delegation.set(received);
                this.loading.set(false);
                this.inWaiting.set(false);

                // l'utente si azzera e si rilegge, così menu e guard vedono subito i permessi ricevuti
                this.authService.currentUser.set(null);
                return this.authService.ensureUserLoaded();
            })
            .then((user: LoggedUser) => user)
            .catch((e: any) => {
                console.log('errore in ngOnInit di AcquirePermissionsPage: ricezione della concessione o rilettura dell\'utente');
                console.log(e);

                if( !this.delegation() ) {
                    this.errorMessage.set(e?.note || 'ricezione non riuscita');
                }

                this.loading.set(false);
                this.inWaiting.set(false);
            })
        ;
    }


    gotoDashboard(): void {
        this.router.navigate(['/dashboard']);
    }
}
