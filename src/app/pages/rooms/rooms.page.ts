import {Component, inject, OnInit, signal} from '@angular/core';
import {PageTitleComponent} from '../../components/page-title.component/page-title.component';
import {firstValueFrom} from 'rxjs';
import {DeviceType, ZoneType} from '../devices/devices.models';
import {RoomsApiService} from './rooms-api';
import {Router} from '@angular/router';
import {urlDecode} from '../../utils/string-utils';
import {LongPressDirective} from '../../directives/long-press.directive';
import {Checkbox, CheckboxChangeEvent} from 'primeng/checkbox';
import {Button} from 'primeng/button';


@Component({
  selector: 'rooms-page',
    imports: [
        PageTitleComponent,
        LongPressDirective,
        Checkbox,
        Button
    ],
  templateUrl: './rooms.page.html',
  styleUrl: './rooms.page.css',
})
export class RoomsPage implements OnInit {

    // constant

    // variables
    selectedRooms: ZoneType[] = [];
    device_count: number = 0;

    // signals
    readonly roomsLoading = signal(true);
    readonly roomsError = signal<string | null>(null);
    readonly rooms = signal<ZoneType[]>([]);
    readonly isInSelection = signal<boolean>(false);

    // services
    private readonly roomsApi = inject(RoomsApiService);
    private readonly router = inject(Router);
    protected readonly inWaiting = signal<boolean>(false);

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
                            device_list: room.device_list || ''
                            // devices:
                            //     (room.device_list || '')
                            //         .split(',')
                            //         .filter((id: string) => !!id)
                                    // .map((id: string) => parseInt(id)),
                        }))
                        .map((room) => {
                            room.devices =
                                (room.device_list || '')
                                    .split(',')
                                    .filter((x: any) => !!x)
                                    .map((x: any) => ({id: parseInt('' +x)} as DeviceType))
                                    // .length
                            ;
                            return {
                                ...room
                            };
                        })
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
                queryParams: {},
                state: {
                    details: room
                }
            });
    }


    onLongPress(room: ZoneType) {
        console.log('inizio delle selezione');
        this.isInSelection.set(true);

    }

    protected toggleSelctedRooms(room: ZoneType, event: CheckboxChangeEvent) {
        this.selectedRooms =
            this.selectedRooms.filter((selected: ZoneType) => selected.id !== room.id);
        if (!!event.checked) {
            this.selectedRooms.push(room);
        }
    }

    protected deleteMultiRoom() {
        firstValueFrom(this.roomsApi.deleteRooms(this.selectedRooms))
            .then((rooms: ZoneType) => {

                this.router.navigate(['/'], {
                    queryParams: {
                        from: 'MULTI_DELETE_ROOMS'
                    },
                    state: {
                        deleted: this.selectedRooms
                    }
                });

            })
            .catch((error: unknown) => {
                console.log('errore in deleteMultiRoom');
                console.log(error);


                this.roomsLoading.set(false);
            });
    }

    // Il click sulla checkbox non deve arrivare a room-block (apertura della stanza).
    // Niente preventDefault: sulla checkbox annullerebbe il cambio di stato.
    protected stopPropagation(event: MouseEvent) {
        event.stopPropagation();
    }
}
