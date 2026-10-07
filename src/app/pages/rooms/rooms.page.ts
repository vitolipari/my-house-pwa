import {Component, inject, OnInit, signal} from '@angular/core';
import {PageTitleComponent} from '../../components/page-title.component/page-title.component';
import {firstValueFrom} from 'rxjs';
import {DeviceType, ZoneType} from '../devices/devices.models';
import {RoomsApiService} from './rooms-api';
import {Router} from '@angular/router';
import {urlDecode} from '../../utils/string-utils';


@Component({
  selector: 'rooms-page',
    imports: [
        PageTitleComponent
    ],
  templateUrl: './rooms.page.html',
  styleUrl: './rooms.page.css',
})
export class RoomsPage implements OnInit {

    // constant

    // variables

    // signals
    readonly roomsLoading = signal(true);
    readonly roomsError = signal<string | null>(null);
    readonly rooms = signal<ZoneType[]>([]);

    // services
    private readonly roomsApi = inject(RoomsApiService);
    private readonly router = inject(Router);

    ngOnInit(): void {
        this.loadAllRooms();
    }

    protected addRoom() {
        this.router.navigate(
            ['/new-room'],
            {
                state: {
                    from: 'roomsPage'
                }
            }
        );
    }

    private loadAllRooms() {
        this.roomsLoading.set(true);
        this.roomsError.set(null);


        return firstValueFrom(this.roomsApi.searchRooms())
            .then((rooms: ZoneType[]) => {

                let normalizedRooms =
                    rooms
                        .map((room) => ({
                            ...room,
                            device_list: room.device_list || '',
                            devices:
                                (room.device_list || '')
                                    .split(',')
                                    .filter((id: string) => !!id)
                                    .map((id: string) => parseInt(id)),
                        }))
                ;
                console.log('rooms arrivate');
                console.log(rooms);
                console.log(normalizedRooms);
                this.rooms.set(normalizedRooms);
                this.roomsLoading.set(false);

            })
            .catch((error: unknown) => {
                console.log('errore in loadRooms');
                console.log(error);


                this.roomsLoading.set(false);
            });


    }

    protected gotoDetailsRoom(room: ZoneType) {
        this.router.navigate(['room-page', room.id], {
                queryParams: {
                    data: 'abc',
                    code: 15
                },
                state: {
                    details: room
                }
            });
    }


}
