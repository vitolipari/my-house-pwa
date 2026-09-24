import {Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {firstValueFrom} from 'rxjs';
import {AuthService} from '../../services/auth';
import {ConfirmRequest} from '../../models/auth.models';

@Component({
    selector: 'app-confirm-signup',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    template: './forgot-password.page.html'
})
export class ForgotPasswordPage {

    private readonly fb = inject(FormBuilder);
    private readonly authService = inject(AuthService);

    readonly loading = signal(false);
    readonly message = signal('');
    readonly errorMessage = signal('');

    readonly form = this.fb.nonNullable.group({
        email: ['', [Validators.required, Validators.email]]
    });

    submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.loading.set(true);
        this.message.set('');
        this.errorMessage.set('');

        try {
            const {email} = this.form.getRawValue();

            // this.authService.forgotPassword(email)

            this.message.set(
                'Se l’email è registrata, riceverai le istruzioni per reimpostare la password.'
            );

            this.form.reset();
        } catch (e: any) {
            console.log('errore nel recupero password');
            console.log(e);
            this.errorMessage.set(
                'Non è stato possibile inviare la richiesta di recupero password.'
            );
        } finally {
            this.loading.set(false);
        }
    }


}
