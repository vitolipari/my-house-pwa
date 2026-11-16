import {Component, inject, OnInit, signal} from '@angular/core';
import {ApiUrlService} from '../../services/api-url-service';
import {firstValueFrom} from 'rxjs';
import {JsonPipe} from '@angular/common';
import {UserBlockComponent} from '../../components/user-block.component/user-block.component';
import {PageTitleComponent} from '../../components/page-title.component/page-title.component';
import {DeleteConfirmComponent} from '../../components/delete-confirm-component/delete-confirm-component';
import {Drawer} from 'primeng/drawer';
import {PageMenu} from '../../components/page-menu/page-menu';
import {Router} from '@angular/router';
import {ProfileType} from '../user/profile.models';

@Component({
    selector: 'app-users-page',
    imports: [
        JsonPipe,
        UserBlockComponent,
        PageTitleComponent,
        DeleteConfirmComponent,
        Drawer,
        PageMenu
    ],
    templateUrl: './users.page.html',
    styleUrls: ['../../../page.css', './users.page.css'],
    standalone: true
})
export class UsersPage implements OnInit {

    // isInWaiting = true;
    isInWaiting = signal(true);
    users = signal<ProfileType[]>([]);
    // users: any[] = [];

    private readonly api = inject<ApiUrlService>(ApiUrlService);
    protected router = inject(Router);

    ngOnInit(): void {


            firstValueFrom(this.api.getUsers())
                .then((result: any) => {
                    console.log('response di getUsers');
                    console.log(result);
                    // this.isInWaiting = false;
                    // this.users = result;
                    this.users.set(result);
                    this.isInWaiting.set(false);
                })
                .catch((e: any) => {
                    console.log('errore in getUsers');
                    console.log(e);
                    this.isInWaiting.set(false);
                    // TODO mostrare messaggio di errore
                })


    }


    protected gotoUserPage(user: ProfileType) {
        this.router.navigate(['user-page', user.id], {
            queryParams: {},
            state: {
                user: user
            }
        });
    }
}
