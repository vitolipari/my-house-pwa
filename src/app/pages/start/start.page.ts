import { Component, inject } from '@angular/core';
import {AuthService} from '../../services/auth';

@Component({
  selector: 'app-startup',
  standalone: true,
  template: `
    <h1>Avvio applicazione</h1>
    <p>Utente autenticato correttamente.</p>

    <button type="button" (click)="logout()">Logout</button>
  `
})
export class StartupPage {
  private readonly authService = inject<AuthService>(AuthService);

  logout(): void {
    this.authService.logout()
      .catch((e: any) => {
        console.log('errore in StartupPage.logout');
        console.log(e);
      });
  }
}
