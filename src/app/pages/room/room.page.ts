import {ChangeDetectorRef, Component, computed, ElementRef, inject, OnInit, signal, ViewChild} from '@angular/core';
import {PageTitleComponent} from '../../components/page-title.component/page-title.component';
import {ActivatedRoute, Router} from '@angular/router';
import {DeviceSmallType, DeviceType, isSensorDevice, VOID_ZONE, ZoneType} from '../devices/devices.models';
import {PermissionService} from '../../services/permission.service';
import {firstValueFrom} from 'rxjs';
import {DeviceApiService} from '../devices/device-api';
import {RoomsApiService} from '../rooms/rooms-api';
import {getLastElementOr} from '../../utils/array-util';
import {SwitcherComponent} from '../../components/switcher/switcher.component';
import {emoj} from '../../utils/string-utils';
import moment from 'moment/moment';
import {timestampInMilliseconds} from '../../utils/time-utils';
import {DEVICE_STATUS_MAX_AGE_MS} from '../devices/devices.page';
import {Button} from 'primeng/button';
import {InputText} from 'primeng/inputtext';
import {FormBuilder, FormsModule, Validators} from '@angular/forms';
import {Checkbox, CheckboxChangeEvent} from 'primeng/checkbox';
import {Drawer} from 'primeng/drawer';
import {DeviceBlockComponent} from '../../components/device-block/device-block.component/device-block.component';

@Component({
  selector: 'app-room.page',
    imports: [
        PageTitleComponent,
        // SwitcherComponent,
        Button,
        InputText,
        FormsModule,
        // Checkbox,
        Drawer,
        DeviceBlockComponent
    ],
  templateUrl: './room.page.html',
  styleUrl: './room.page.css',
})
export class RoomPage implements OnInit {


    // selectedDevices: DeviceType[] = [];
    selectedDevices: number[] = [];
    openConfirmDeletion: boolean = false;

    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly permissionService = inject(PermissionService);
    private readonly deviceApi = inject(DeviceApiService);
    private readonly roomsApi = inject(RoomsApiService);
    private readonly fb = inject(FormBuilder);


    room = VOID_ZONE;
    readonly errors = signal<{name:string; picture: string, devices: number[];} | null>({name: 'Nuova Stanza', picture: '', devices: []});

    readonly isInDetailsMode = signal<boolean>(false);
    readonly isInEditMode = signal<boolean>(false);

    readonly isInDeleteRoomInWaiting = signal<boolean>(false);
    readonly isInLinkRoomInWaiting = signal<boolean | null>(false);

    readonly devicesLoading = signal(false);
    readonly roomDataLoading = signal(false);
    // readonly availableDevices = signal<DeviceType[]>([]);
    availableDevices: DeviceType[] = [];
    // readonly isDeviceStatusInWaiting = signal<{ id: number | string; inWaiting: boolean }[]>([{
    //     id: 0,
    //     inWaiting: false
    // }]);
    readonly devicesError = signal<string | null>(null);
    isDeviceWaiting = signal<boolean>(false);

    protected readonly isReadyToSet = computed(() => (
        this.room.name.trim().length > 0
        // && this.data().availableDevices.length > 0
    ));
    protected readonly isSavingInWait = signal<boolean>(false);

    readonly routeInfo = this.route.snapshot.data; // oggetto data della rotta = accessControl.permission
    readonly pathVariables = this.route.snapshot.params; // oggetto con i pathVariables
    readonly routeParamater = this.route.snapshot.queryParams; // oggetto con la query string
    readonly navigationData = this.router.currentNavigation()?.extras.state;    // passato dalla navigazione


    @ViewChild("roomName", {static: true, read: ElementRef}) roomName!: ElementRef<HTMLInputElement>;


    readonly roomForm = this.fb.nonNullable.group({
        roomName: ['', [Validators.required]],
        devices: ['', []]
    });
    protected readonly inWaiting = signal<boolean>(false);
    isDevicePanel: boolean = false;

    constructor(private cdr: ChangeDetectorRef) {
        console.log('RoomPage constructor');


            if( !this.navigationData || !this.navigationData['details'] ) {



                if(!!this.pathVariables['id']) {
                    // arrivato da url
                    console.log('Stanza da navigazione URL');

                    console.log('dati della room assenti, parte la chiamata');

                    this.roomDataLoading.set(true);

                    firstValueFrom(this.roomsApi.searchRooms({id: this.pathVariables['id']}))
                        .then((rooms: ZoneType[]) => {

                            console.log('caricati i dati della room attuale '+ this.pathVariables['id']);

                            let dataRoom = rooms.reduce(getLastElementOr, null);

                            this.room = {
                                ...this.room,
                                ...dataRoom,
                                picture: rooms.reduce(getLastElementOr, {picture: ''}).picture,
                                name: rooms.reduce(getLastElementOr, {name: 'Nessuna Stanza'}).name
                            };
                            this.room.devices = this.room.devices || [];

                            this.roomForm.controls.roomName.setValue(this.room.name);
                            this.roomDataLoading.set(false);

                            this.isInDetailsMode.update(() => true);

                            // alla fine del caricamento caricare i device
                            // this.loadOwnDevices();  // TODO

                        })
                        .catch((error: unknown) => {
                            console.log('errore in loadRooms');
                            console.log(error);
                        });
                }
                else {
                    // new-room
                    console.log('Nuova stanza');
                    this.loadAvailableDevices()

                }

            }
            else {

                // arrivato dalla navigazione
                console.log('Stanza da navigazione');

                this.inWaiting.set(true);
                this.roomDataLoading.set(true);
                this.room = {
                    ...this.room,
                    ...(this.navigationData!['details'] as ZoneType),
                    // devices: devices
                };
                this.roomForm.controls.roomName.setValue(this.room.name);
                this.loadOwnedDevices()
                    .then((devices: DeviceType[]) => {

                        this.roomDataLoading.set(false);
                        this.inWaiting.set(false);
                        // arrivato da navigazione interna es.: arrivato dalla pagina rooms
                        this.isInDetailsMode.update(() => true);
                        console.log(devices);
                        console.log(this.availableDevices);
                        console.log(this.room);

                    })
                    .catch((error: unknown) => {
                        console.log('errore in loadRooms');
                        console.log(error);
                    });


            }
        // }
        // else {
        //
        // }



    }

    ngOnInit(): void {


        // this.devicesLoading.set(true);

        if( !this.permissionService.hasPermission(this.routeInfo["accessControl"].permission) ) {
            // per qualche strano motivo questo componente é stato instanziato senza permesso
            // TODO da notificare e loggare
        }


    }


    /**
     * Carica i dispositivi posseduti dalla stanza
     */
    loadOwnedDevices(): Promise<DeviceType[]> {
        this.isDeviceWaiting.set(true);

        if( (this.room.devices || [{id: 0} as DeviceType]).every((rd: DeviceType) => !!rd.name) ) {
            console.log('loadOwnedDevices | tutti i devices hanno il name');
            return Promise.resolve(this.room.devices as DeviceType[]);
        }
        else {
            console.log(`loadOwnedDevices | caricamento dei devices ${ this.room.device_list.split(',') }`);
            console.log(this.room);
            console.log(this.room.device_list);
            console.log(this.room.device_list.split(','));
            return (
                firstValueFrom(this.deviceApi.search({ids: this.room.device_list.split(',')}))
                    .then((devices: DeviceType[]) => {

                        console.log('device cercati');
                        console.log(devices);

                        this.room.devices = devices;

                        return devices;
                    })
                    .catch((error: unknown) => {
                        console.log('errore in loadOwnedDevices');
                        console.log(error);

                        this.isDeviceWaiting.set(false);
                        return Promise.reject(error);
                    })
            )
        }


    }

    /**
     * Carica i dispositivi disponibili per la stanza
     */
    loadAvailableDevices(): Promise<DeviceType[]> {
        this.isDeviceWaiting.set(true);

        return (
            firstValueFrom(this.deviceApi.list())
                .then((devices: DeviceType[]) => {

                    console.log('device tutti');
                    console.log(devices);
                    console.log(devices.filter((device: DeviceType) => ((device.where.length === 0) || (!device.where) || (device.where.reduce(getLastElementOr, {id: 0}).id === -1))));

                    this.availableDevices =
                        devices
                            .filter((device: DeviceType) => ((device.where.length === 0) || (!device.where) || (device.where.reduce(getLastElementOr, {id: 0}).id === -1)))
                    ;

                    this.isDeviceWaiting.set(false);
                    console.log('dispositivi arrivati per la nuova stanza');
                    console.log( this.availableDevices );
                    return this.availableDevices;
                })
                .catch((error: unknown) => {
                    console.log('errore in loadAvailableDevices del nuovo gruppo');
                    console.log(error);

                    this.isDeviceWaiting.set(false);
                    return Promise.reject(error);
                })
        );
    }


    // setDevices(availableDevices: DeviceType[]) {
    //
    //     let devicesIds: number[] = [
    //             ...this.room.device_list
    //                 .split(',')
    //                 .map((id: string) => parseInt(id)),
    //             ...availableDevices.map((device: DeviceType) => parseInt(''+ device.id))
    //         ]
    //             .map((id: number, index: number, list: number[]) => {
    //                 if(list.includes(id)) return 0;
    //                 return id;
    //             })
    //             .filter((id: number) => !!id)
    //             .sort((a: number, b: number) => a - b)
    //     ;
    //     let devicesIds_string: string = devicesIds.join(',');
    //
    //     this.room = {
    //         ...data,
    //         device_list: devicesIds_string
    //         // availableDevices: devicesIds
    //     };
    // }



    toggleSelctedDevice(toggledDevice: DeviceType, event: boolean) {
        const devicesInRoom: DeviceType[] = (this.room.devices as DeviceType[]) ?? [];
        let devices: DeviceType[] = [];
        if(!!event) {

            if(!!this.isDeviceInRoom(toggledDevice)) {
                // non dovrebbe accadere MAI
            }
            else {
                // metti la spunta a un dispositivo disponibile
                this.availableDevices =
                    this.availableDevices
                        .filter((available: DeviceType) => available.id !== toggledDevice.id);
                ;
                devices = [...devicesInRoom, toggledDevice];
            }


        }
        else {
            if(!!this.isDeviceInRoom(toggledDevice)) {
                // togli la spunta da un dispositivo della stannza
                devices = devicesInRoom.filter((d: DeviceType) => String(d.id) !== String(toggledDevice.id));
                this.availableDevices = [...this.availableDevices, toggledDevice];
            }
            else {
                // non dovrebbe accadere MAI
            }

        }


        this.room = {
            ...this.room,
            devices: devices,
            device_list: devices.map((d: DeviceType) => d.id).join(',')
        };

    }



    isDeviceInRoom(device: DeviceType): boolean {
        return ((this.room?.devices as DeviceType[]) ?? [])
            .some((d: DeviceType) => String(d.id) === String(device.id));
    }


    hasPermission(permission: string): boolean {
        return this.permissionService.hasPermission(permission);
    }




    editData() {
        this.loadAvailableDevices();
        this.isInEditMode.update(() => true);
        this.isInDetailsMode.update(() => false);
    }


    editRoom() {
        console.log('nuovi dati della stanza');
        console.log( this.room);
        this.inWaiting.update(() => true);



        firstValueFrom(this.roomsApi.editRoom( this.room ))
            .then((room: ZoneType) => {

                this.room = {...this.room, ...room};

                this.router.navigate(['rooms-page'], {
                    queryParams: {},
                    state: {
                        details: room
                    }
                });


            })
            .catch((error: unknown) => {
                console.log('errore in editRoom');
                console.log(error);

                const candidate = error as {error?: {error?: string}; message?: string};
                this.devicesError.set(
                    candidate.error?.error ?? candidate.message ?? 'Impossibile caricare i dispositivi'
                );
                this.devicesLoading.set(false);
            });


    }

    onImageSelected(event: Event) {
        console.log('immagine selezionata');

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

        // this.profileImageFile = file;

        const reader = new FileReader();
        reader.onload = () => {

            this.room = {
                ...this.room,
                picture: reader.result as string
            };
            // console.log( this.previewUrl );
            this.cdr.detectChanges();

        };

        reader.readAsDataURL(file);

    }

    protected deleteRoom() {
        this.openConfirmDeletion = true;
    }

    protected duplicate() {

    }


    goToMatterPage() {
        this.router.navigate(['matter-bridge'], {
            queryParams: { from: 'devices-page' },
            state: {}
        });
    }


    protected confirmDeleteRoom() {
        this.isInDeleteRoomInWaiting.update(() => true);
        firstValueFrom(this.roomsApi.deleteRooms([this.room]))
            .then(() => {
                this.isInDeleteRoomInWaiting.update(() => false);
                this.router.navigate(['/rooms-page']);
                // window.location.reload();
            })
            .catch((e) => {
                console.log(e);
            })
        ;
    }

    addNewRoom() {
        console.log(`name: ${ this.room.name }`);
        console.log(this.room);

        return firstValueFrom(this.roomsApi.newRoom(this.room))
            .then((newId: number) => {
                this.router.navigate(
                    ['/rooms-page'],
                    {
                        state: {
                            from: 'newRoomPage',
                            newId: newId
                        }
                    }
                );
            })
            .catch((error: unknown) => {
                console.log('errore in addNewRoom');
                console.log(error);
            });

    }

    isOwned = (device: DeviceType) => !!this.room.devices?.find((od: DeviceType) => od.id === device.id);
}
