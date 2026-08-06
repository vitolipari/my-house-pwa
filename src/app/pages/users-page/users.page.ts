import {Component, inject, OnInit} from '@angular/core';
import {ApiUrlService} from '../../services/api-url-service';
import {firstValueFrom} from 'rxjs';
import {JsonPipe} from '@angular/common';
import {UserBlockComponent} from '../../components/user-block.component/user-block.component';

@Component({
    selector: 'app-users-page',
    imports: [
        JsonPipe,
        UserBlockComponent
    ],
    templateUrl: './users.page.html',
    styleUrl: './users.page.css',
    standalone: true
})
export class UsersPage implements OnInit {

    isInWaiting = true;
    users: any[] = [];

    private readonly api = inject<ApiUrlService>(ApiUrlService);

    ngOnInit(): void {


            firstValueFrom(this.api.getUsers())
                .then((result: any) => {
                    console.log('response di getUsers');
                    console.log(result);
                    this.isInWaiting = false;
                    this.users = result;
                })
                .catch((e: any) => {
                    console.log('errore al get users in users.page')
                    console.log(e);
                    debugger;
                    this.isInWaiting = false;
                    // TODO mostrare messaggio di errore
                })


    }


}
