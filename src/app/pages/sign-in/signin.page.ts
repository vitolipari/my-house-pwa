import {Component, computed, effect, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../services/auth';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import {DarkModeService} from '../../services/dark-mode-service';
import {Button, ButtonModule} from 'primeng/button';

@Component({
    selector: 'app-sign-in',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, InputTextModule, FormsModule, Button],
    templateUrl: './signin.page.html',
    styleUrls: [
        '../../../page.css',
        './signin.page.css'
        , '../sign-up/signup.page.css'
        , '../profile/profile.page.css'
    ]
})
export class SignInPage {
    private readonly fb = inject(FormBuilder);
    private readonly authService = inject<AuthService>(AuthService);
    private readonly router = inject(Router);
    protected readonly darkModeService = inject(DarkModeService);

    readonly loading = signal(false);
    readonly errorMessage = signal('');
    inWaiting = signal(false);
    isWaiting = computed(() => this.inWaiting());

    errors: any = {}
    visibility: any = {
        password: false,
        confirmPassword: false
    };

    readonly form = this.fb.nonNullable.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]]
    });

     currentColor = getComputedStyle(document.body).getPropertyValue("--color-text-1");


    constructor() {
        effect(() => {
            const isDark = this.darkModeService.isDarkMode();

            console.log('Dark mode cambiata:', isDark);
        });
    }

    async submit(): Promise<void> {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.inWaiting.set(true);

        // this.loading.set(true);
        // this.errorMessage.set('');

        try {
            this.authService.login(this.form.getRawValue())
                .then((response: any) => {
                    console.log('signin response');
                    console.log(response);


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

                    if( err.toLowerCase().trim().indexOf('email') !== -1 ) {
                        this.errors.email = err;
                    }

                    if( err.toLowerCase().trim().indexOf('password') !== -1 ) {
                        this.errors.password = err;
                    }

                    this.inWaiting.set(false);
                })
            ;
            // await this.router.navigate(['/dashboard']);
        } catch {
            this.errorMessage.set('Login non riuscito o server non raggiungibile.');
        } finally {
            this.loading.set(false);
        }
    }


    toggleVisibility(field: string) {
        this.visibility[ field ] = !this.visibility[ field ];
    }


}
