import {ChangeDetectorRef, Component, computed, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../services/auth';
import {firstValueFrom} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Button, ButtonModule} from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    selector: 'app-sign-up',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, InputTextModule, FormsModule, Button],
    templateUrl: './signup.page.html',
    styleUrls: ['../../../page.css', '../sign-in/signin.page.css', './signup.page.css']
})
export class SignUpPage {
    private readonly fb = inject(FormBuilder);
    private readonly authService = inject<AuthService>(AuthService);
    private readonly router = inject(Router);
    http = inject(HttpClient);

    // readonly loading = signal(false);
    inWaiting = signal(false);
    isWaiting = computed(() => this.inWaiting());
    readonly message = signal('');
    readonly errorMessage = signal('');

    readonly form = this.fb.nonNullable.group({
        fullName: ['', Validators.required],
        mobilenumber: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]]
    });

    errors: any = {}
    visibility: any = {
        password: false,
        confirmPassword: false
    };

    profileImageFile: File | null = null;
    previewUrl: string | null = null;

    constructor(private cdr: ChangeDetectorRef) {}


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


    async submit(): Promise<void> {


        this.errors = {};
        let value: any = this.form.getRawValue();
        console.log(value);

        if (value.password !== value.confirmPassword) {
            console.log('Le password non coincidono.');
            console.log(this.form.getRawValue());
            console.log(this.form.controls.password.value);
            console.log(this.form.controls.password.getRawValue());
            console.log(this.form.controls.confirmPassword.value);
            console.log(this.form.controls.confirmPassword.getRawValue());

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

        if (this.form.invalid) {
            // this.form.markAllAsTouched();

            console.log( 'form is NOT valid' );
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
        // this.message.set('');
        // this.inWaiting = true;

        try {
            // const response = await this.authService.signUp(value);
            // console.log('response di signup');
            // console.log( response );


            this.authService.signUp(value)
                .then((response: any) => {
                    console.log('signup response');
                    console.log(response);


                    this.authService.saveLoggedUser( response.user );
                    this.authService.saveToken( response.accessToken );

                    this.inWaiting.set(false);

                    console.log('avvio navigazione verso dashboard');
                    this.router.navigate(['/dashboard']);

                })
                .catch((e: any) => {
                    console.log('errore della promise signup');
                    console.log(e);

                    let err = e;
                    if( typeof e === 'string' ) {

                    }
                    else {
                        if( !!e.code ) {
                            err = e.code;
                        }
                    }


                    // alert(err);
                    if( err.toLowerCase().trim().indexOf('email') !== -1 ) {
                        this.errors.email = err;
                    }
                    if( err.toLowerCase().trim().indexOf('phone') !== -1 ) {
                        this.errors.mobilenumber = err;
                    }
                    if( err.toLowerCase().trim().indexOf('mobile') !== -1 ) {
                        this.errors.mobilenumber = err;
                    }
                    if( err.toLowerCase().trim().indexOf('number') !== -1 ) {
                        this.errors.mobilenumber = err;
                    }
                    if( err.toLowerCase().trim().indexOf('unique') !== -1 ) {
                        this.errors.mobilenumber = 'Numero Esistente';
                    }


                    // TODO controllo sessione scaduta

                    // TODO controllo sessione inesistente


                    // TODO gestire l'errore generale

                    this.inWaiting.set(false);
                })


            // debugger;
            // await this.router.navigate(['/access/confirm'], {
            //     queryParams: {email: value.email}
            // });

        } catch {
            console.log('errore');
            this.message.set('Registrazione non riuscita.');
        } finally {
            // this.inWaiting.set(false);
        }
    }

    toggleVisibility(field: string) {
        this.visibility[ field ] = !this.visibility[ field ];
    }

    takeProfileImage() {

    }
}
