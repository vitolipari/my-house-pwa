import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {LoggedUser} from '../../models/auth.models';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './dashboard.page.html',
    styleUrls: ['../../../page.css', 'dashboard.page.css']
})
export class DashboardPage implements OnInit {

    http = inject(HttpClient);

    ngOnInit(): void {

        // console.log('avvio le chiamate di test in dashboard');
        //
        // Promise.all([
        //         firstValueFrom(this.http.get<{ profile: LoggedUser; accessToken: string; }>('/test/get-con-response')),
        //         firstValueFrom(this.http.get<{ profile: LoggedUser; accessToken: string; }>('/test/get-senza-response')),
        //         firstValueFrom(this.http.post<{ profile: LoggedUser; accessToken: string; }>('/test/post-con-response', {id: 15})),
        //         firstValueFrom(this.http.post<{ profile: LoggedUser; accessToken: string; }>('/test/post-senza-response', {id: 15}))
        //     ])
        //     .then((responses: any[]) => {
        //         console.log('fine chiamate di test');
        //         console.log( responses );
        //     })
        //     .catch((e: any) => {
        //         console.log('errore alle chiamate di test in dashboard');
        //         console.log(e);
        //     })


    }


}
