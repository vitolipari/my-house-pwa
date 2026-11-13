import {ChangeDetectorRef, Component, computed, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../services/auth';
import {Button, ButtonModule} from 'primeng/button';
import {InputText, InputTextModule} from 'primeng/inputtext';
import {HttpClient} from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import {Drawer} from 'primeng/drawer';
import {Checkbox} from 'primeng/checkbox';
import {DatePickerModule} from 'primeng/datepicker';
import {QRCodeComponent} from 'angularx-qrcode';
import {firstValueFrom} from 'rxjs';
import moment from 'moment';
import {LoggedUser} from '../../models/auth.models';
import {PermissionService} from '../../services/permission.service';
import {getLastElementOr} from '../../utils/array-util';
import {PermissionApiService} from './permission-api';
import {PermissionType} from './permission.models';


@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, Button, InputTextModule, FormsModule, Drawer, Checkbox, DatePickerModule, QRCodeComponent],
    templateUrl: './profile.page.html',
    styleUrls: [
        '../../../page.css',
        './profile.page.css',
        // '../sign-in/signin.page.css',
        '../sign-up/signup.page.css'
    ]
})
export class ProfilePage {

    authService = inject(AuthService);
    readonly user = inject(AuthService).currentUser;
    private readonly router = inject(Router);
    http = inject(HttpClient);
    private readonly fb = inject(FormBuilder);


    previewUrl: string = this.user()!.picture;

    isInEdit: boolean = false;
    inWaiting = signal(false);
    isWaiting = computed(() => this.inWaiting());
    readonly message = signal('');
    readonly errorMessage = signal('');

    readonly form = this.fb.nonNullable.group({
        fullName: [this.user()?.username],
        mobilenumber: [this.user()?.mobile],
        email: [this.user()?.email, Validators.email],
        currentPassword: [''],
        newPassword: ['', [Validators.minLength(8)]],
        confirmPassword: ['']
    });

    errors: any = {}
    visibility: any = {
        currentPassword: false,
        newPassword: false,
        confirmPassword: false
    };

    profileImageFile: File | null = null;
    isInChangePassword: boolean = false;

    readonly permissionApi = inject(PermissionApiService);
    readonly permissionService = inject(PermissionService);

    // sezione «Richiedi permesso»: drawer, permessi ancora da ottenere, scelta, scadenza, indirizzo del QR e messaggio
    isRequestPermissionPanel: boolean = false;
    readonly requestInWaiting = signal(false);
    readonly requestablePermissions = signal<PermissionType[]>([]);
    selectedRequestPermissions: string[] = [];
    requestExpDate: Date | null = null;
    readonly requestQRUrl = signal('');
    readonly requestMessage = signal('');

    // sezione «Concedi permessi»: gli stessi campi, per i permessi che l'utente ha già
    isDelegatePermissionPanel: boolean = false;
    readonly delegateInWaiting = signal(false);
    readonly delegablePermissions = signal<PermissionType[]>([]);
    selectedDelegatePermissions: string[] = [];
    delegateExpDate: Date | null = null;
    readonly delegateQRUrl = signal('');
    readonly delegateMessage = signal('');

    // il Core rifiuta una scadenza già passata: il calendario non mostra i giorni prima di oggi
    readonly minExpDate: Date = new Date();


    constructor(
        private cdr: ChangeDetectorRef
    ) {}




    onProfileImageSelected(event: Event): void {
        const input = event.target as HTMLInputElement;

        if (!input.files || input.files.length === 0) {
            return;
        }

        const file = input.files[0];

        if (!file.type.startsWith('image/')) {
            alert('Puoi caricare solo immagini');
            return;
        }

        const maxSizeMb = 5;
        if (file.size > maxSizeMb * 1024 * 1024) {
            alert(`Immagine troppo grande. Massimo ${maxSizeMb}MB`);
            return;
        }

        this.profileImageFile = file;

        const reader = new FileReader();
        reader.onload = () => {



            this.previewUrl = reader.result as string;
            console.log( this.previewUrl );
            this.cdr.detectChanges();

        };

        reader.readAsDataURL(file);
    }


    // salva il profilo e riallinea il form con i dati che il Core ha davvero salvato
    submit(): void {


        this.errors = {};
        let value: any = this.form.getRawValue();
        console.log(value);

        if (value.newPassword !== value.confirmPassword) {
            // console.log('Le password non coincidono.');
            // console.log(this.form.getRawValue());
            // console.log(this.form.controls.password.value);
            // console.log(this.form.controls.password.getRawValue());
            // console.log(this.form.controls.confirmPassword.value);
            // console.log(this.form.controls.confirmPassword.getRawValue());

            this.errors.confirmPassword = 'Le password non coincidono.'

            // this.message.set('Le password non coincidono.');
            // return;
        }

        if(!this.previewUrl) {
            this.errors.profilePicture = 'Manca límmagine di profilo'
            // return;
        }

        /*
        {
            "fullName": "Vito Lipari",
            "mobilenumber": "3281368113",
            "email": "vito@mail.com",
            "password": "poipoipoi",
            "confirmPassword": "poipoipoi"
        }
         */
        value.profilePicture = this.previewUrl;
        value.id = this.user()?.id;
        value.isInChangePassword = this.isInChangePassword;

        if (this.form.invalid) {
            // this.form.markAllAsTouched();

            console.log( 'form del profilo NON valido' );
            console.log( this.form );

            Object.entries(this.form.controls)
                .filter(([field, control]) => (!!control.errors))
                .filter(([field, control]) => (field !== 'confirmPassword'))
                .map(([field, control]) => {
                    // console.log(field, control.errors);
                    // console.log(Object.entries(control.errors));
                    this.errors[ field ] = Object.keys(control.errors ?? {}).join(', ');
                    // this.errors[ field ] = 'error';
                })

            // firstValueFrom(this.http.post('/user/signin', this.form))

            // return;
        }

        if( Object.keys(this.errors).length > 0 ) {
            return;
        }


        this.inWaiting.set(true);
        this.message.set('');
        this.errorMessage.set('');

        this.authService.editProfile(value)
            .then(updatedUser => {
                this.previewUrl = updatedUser.picture;
                this.profileImageFile = null;
                this.isInEdit = false;
                this.isInChangePassword = false;

                this.form.patchValue({
                    fullName: updatedUser.username,
                    mobilenumber: updatedUser.mobile,
                    email: updatedUser.email,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });

                this.message.set('Profilo aggiornato.');
            })
            .catch((e: any) => {
                console.log('errore della modifica profilo');
                console.log(e);

                const err = String(e?.code ?? e?.message ?? e ?? 'Errore durante la modifica del profilo');
                const normalizedError = err.toLowerCase().trim();

                if (normalizedError.includes('email')) {
                    this.errors.email = err;
                }
                if (
                    normalizedError.includes('phone')
                    || normalizedError.includes('mobile')
                    || normalizedError.includes('number')
                ) {
                    this.errors.mobilenumber = err;
                }
                if (normalizedError.includes('unique')) {
                    this.errors.mobilenumber = 'Numero Esistente';
                }
                if (normalizedError.includes('password')) {
                    this.errors.currentPassword = err;
                }
                if (Object.keys(this.errors).length === 0) {
                    this.errorMessage.set(err);
                }
            })
            .finally(() => {
                this.inWaiting.set(false);
            });
    }

    toggleVisibility(field: string) {
        this.visibility[ field ] = !this.visibility[ field ];
    }

    logout() {
        this.authService.logout()
            .then(() => this.router.navigate(['/dashboard']))
            .catch((e: any) => {
                console.log('errore in ProfilePage.logout: navigazione dopo il logout');
                console.log(e);
            });
    }

    edit() {
        this.isInEdit = true;
    }

    // apre il drawer «Richiedi permesso»: azzera la scelta precedente e legge il catalogo, togliendo i permessi che l'utente ha già
    openRequestPermissionDrawer(): void {

        this.isRequestPermissionPanel = true;
        this.selectedRequestPermissions = [];
        this.requestExpDate = null;
        this.requestQRUrl.set('');
        this.requestMessage.set('');
        this.requestInWaiting.set(true);

        let user: LoggedUser = this.user()!;

        let userPermissions: string[] = Array.isArray(user.permissions) ? user.permissions : [user.permissions];

        let userAuthorizations: string[] = Array.isArray(user.authorizations) ? user.authorizations : [user.authorizations];

        firstValueFrom(this.permissionApi.searchPermissions())
            .then((catalog: PermissionType[]) => {

                // per le autorizzazioni conta la parte prima di @AAAAMMGG
                let alreadyOwned: string[] = userPermissions.concat(
                    userAuthorizations
                        .map((authorization: string) => authorization.split('@')[0])
                );

                this.requestablePermissions.set(
                    catalog
                        .filter((permission: PermissionType) => !alreadyOwned.includes(permission.name))
                );

                this.requestInWaiting.set(false);
            })
            .catch((e: any) => {
                console.log('errore in openRequestPermissionDrawer di ProfilePage: lettura del catalogo dei permessi');
                console.log(e);
                this.requestInWaiting.set(false);
                this.requestMessage.set(e?.note || 'catalogo dei permessi non letto');
            })
        ;
    }

    // invia la richiesta al Core: nel drawer il QR sostituisce la lista e porta l'indirizzo per chi può concedere
    requestPermissions(): void {

        let user: LoggedUser = this.user()!;

        let exp: string = moment(this.requestExpDate).format('YYYY-MM-DD');

        this.requestInWaiting.set(true);
        this.requestMessage.set('');

        firstValueFrom(this.permissionApi.requestPermissions(user.id, this.selectedRequestPermissions, exp))
            .then((response: { requestID: number; }) => {
                this.requestQRUrl.set(window.location.origin + '/grant-permission-request/' + response.requestID);
                this.requestInWaiting.set(false);
            })
            .catch((e: any) => {
                console.log('errore in requestPermissions di ProfilePage: invio della richiesta di permessi');
                console.log(e);
                this.requestInWaiting.set(false);
                this.requestMessage.set(e?.note || 'richiesta non riuscita');
            })
        ;
    }

    // apre il drawer «Concedi permessi»: i permessi effettivi dell'utente, senza doppioni e con la descrizione del catalogo
    openDelegatePermissionDrawer(): void {

        this.isDelegatePermissionPanel = true;
        this.selectedDelegatePermissions = [];
        this.delegateExpDate = null;
        this.delegateQRUrl.set('');
        this.delegateMessage.set('');
        this.delegateInWaiting.set(true);

        let user: LoggedUser = this.user()!;

        let userPermissions: string[] = Array.isArray(user.permissions) ? user.permissions : [user.permissions];

        let userAuthorizations: string[] = Array.isArray(user.authorizations) ? user.authorizations : [user.authorizations];

        let ownedNames: string[] = [];

        userPermissions
            .forEach((permission: string) => {
                if( !!permission && !ownedNames.includes(permission) ) {
                    ownedNames.push(permission);
                }
            })
        ;

        // per le autorizzazioni conta la parte prima di @AAAAMMGG
        userAuthorizations
            .forEach((authorization: string) => {
                let name: string = authorization.split('@')[0];
                if( !!name && !ownedNames.includes(name) ) {
                    ownedNames.push(name);
                }
            })
        ;

        firstValueFrom(this.permissionApi.searchPermissions())
            .then((catalog: PermissionType[]) => {

                let delegable: PermissionType[] = [];

                // un permesso assente dal catalogo si mostra con il solo nome
                ownedNames
                    .forEach((name: string) => {
                        let permission: PermissionType | null = catalog
                            .filter((element: PermissionType) => element.name === name)
                            .reduce(getLastElementOr, null)
                        ;
                        delegable.push(!!permission ? permission : {name: name, description: ''});
                    })
                ;

                this.delegablePermissions.set(delegable);
                this.delegateInWaiting.set(false);
            })
            .catch((e: any) => {
                console.log('errore in openDelegatePermissionDrawer di ProfilePage: lettura del catalogo per la concessione');
                console.log(e);
                this.delegateInWaiting.set(false);
                this.delegateMessage.set(e?.note || 'catalogo dei permessi non letto per la concessione');
            })
        ;
    }

    // invia la concessione al Core: nel drawer il QR sostituisce la lista e porta l'indirizzo per chi riceve
    delegatePermissions(): void {

        let user: LoggedUser = this.user()!;

        let exp: string = moment(this.delegateExpDate).format('YYYY-MM-DD');

        this.delegateInWaiting.set(true);
        this.delegateMessage.set('');

        firstValueFrom(this.permissionApi.delegatePermissions(user.id, this.selectedDelegatePermissions, exp))
            .then((response: { delegationID: number; }) => {
                this.delegateQRUrl.set(window.location.origin + '/delegate-permission/' + response.delegationID);
                this.delegateInWaiting.set(false);
            })
            .catch((e: any) => {
                console.log('errore in delegatePermissions di ProfilePage: invio della concessione dei permessi');
                console.log(e);
                this.delegateInWaiting.set(false);
                this.delegateMessage.set(e?.note || 'concessione non riuscita');
            })
        ;
    }
}
