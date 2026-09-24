import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth';
import { ConfirmRequest } from '../../models/auth.models';

@Component({
  selector: 'app-confirm-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <h1>Conferma account</h1>

    <form [formGroup]="form" (ngSubmit)="submit()">
      <input type="email" formControlName="email" placeholder="Email" />
      <input type="text" formControlName="code" placeholder="Codice di conferma" />

      <button type="submit" [disabled]="loading()">Conferma</button>
    </form>

    <p *ngIf="message()">{{ message() }}</p>

    <a routerLink="/access/sign-in">Torna al login</a>
  `
})
export class ConfirmSignupPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly message = signal('');

  readonly form = this.fb.nonNullable.group({
    email: [this.route.snapshot.queryParamMap.get('email') ?? '', [Validators.required, Validators.email]],
    code: ['', Validators.required]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.message.set('');

    // this.authService.confirm(this.form.getRawValue())
    this.router.navigate(['/access/sign-in'], {
      queryParams: { confirmed: 'true' }
    })
      .catch((e: any) => {
        console.log('errore nella conferma della registrazione');
        console.log(e);
        this.message.set('Conferma non riuscita.');
      })
      .finally(() => this.loading.set(false));
  }
}
