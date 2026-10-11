import {ChangeDetectorRef, Component, ElementRef, inject, OnInit, signal, ViewChild} from '@angular/core';
import {PageTitleComponent} from '../../components/page-title.component/page-title.component';
import {ActivatedRoute, Router} from '@angular/router';
import {DeviceSmallType, DeviceType, isSensorDevice, ZoneType} from '../devices/devices.models';
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

@Component({
  selector: 'app-room.page',
    imports: [
        PageTitleComponent,
        SwitcherComponent,
        Button,
        InputText,
        FormsModule,
        Checkbox
    ],
  templateUrl: './room.page.html',
  styleUrl: './room.page.css',
})
export class RoomPage implements OnInit {


    selectedDevices: DeviceType[] = [];

    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly permissionService = inject(PermissionService);
    private readonly deviceApi = inject(DeviceApiService);
    private readonly roomsApi = inject(RoomsApiService);
    private readonly fb = inject(FormBuilder);

    readonly room = signal<ZoneType>(null as unknown as ZoneType);
    readonly isInEdit = signal<boolean>(false);
    readonly devicesLoading = signal(false);
    readonly roomDataLoading = signal(false);
    readonly devices = signal<DeviceType[]>([]);
    readonly isDeviceStatusInWaiting = signal<{ id: number | string; inWaiting: boolean }[]>([{
        id: 0,
        inWaiting: false
    }]);
    readonly devicesError = signal<string | null>(null);

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

    constructor(private cdr: ChangeDetectorRef) {
        console.log('RoomPage constructor');

    }

    ngOnInit(): void {


        this.devicesLoading.set(true);

        if( !this.permissionService.hasPermission(this.routeInfo["accessControl"].permission) ) {
            // per qualche strano motivo questo componente é stato instanziato senza permesso
            // TODO da notificare e loggare
        }


        console.log('controllo pathVariabile');
        console.log(!!this.navigationData ? this.navigationData['details'] : 'null');

        if( !this.navigationData || !this.navigationData['details'] ) {
            // bisogna caricare i dati della stanza
            // perché non sono arrivati dalla navigazione interna

            console.log('dati della room assenti, parte la chiamata');

            this.roomDataLoading.set(true);

            firstValueFrom(this.roomsApi.searchRooms({id: this.pathVariables['id']}))
                .then((rooms: ZoneType[]) => {

                    console.log('caricati i dati della room attuale '+ this.pathVariables['id']);

                    this.room.update((room: ZoneType) => ({
                        ...this.room(),
                        picture: rooms.reduce(getLastElementOr, {picture: ''}).picture,
                        name: rooms.reduce(getLastElementOr, {name: 'Nessuna Stanza'}).name
                    }));

                    this.roomForm.controls.roomName.setValue(this.room().name);
                    this.roomDataLoading.set(false);


                    // alla fine del caricamento caricare i device
                    this.loadOwnDevices();

                })
                .catch((error: unknown) => {
                    console.log('errore in loadRooms');
                    console.log(error);
                });


        }
        else {
            this.room.update( () => this.navigationData!['details'] as ZoneType );
            this.roomForm.controls.roomName.setValue(this.room().name);
            this.loadOwnDevices();
        }

    }

    loadOwnDevices() {
        return (
            firstValueFrom(this.deviceApi.search({zones: [this.pathVariables['id']]}))
                .then((devices: DeviceType[]) => {

                    console.log('arrivati i dati dei proppri devices');

                    // this.devices.set( devices );
                    this.devicesLoading.set(false);

                    this.room.update(() => ({
                        ...this.room(),
                        devices: devices,
                        device_list: devices.map((device: DeviceType) => device.id).join(',')
                    }));


                    console.log('propri devices arrivati');
                    console.log(devices);
                    console.log(this.room());
                })
                .catch((error: unknown) => {
                    console.log('errore in loadOwnDevices nella pagina della room');
                    console.log(error);
                })
        )
    }


    loadDevices(): Promise<void> {
        this.devicesLoading.set(true);
        this.devicesError.set(null);

        return firstValueFrom(this.deviceApi.list())
            .then((devices: DeviceType[]) => {
                console.log('arrivati i dati dei devices');
                this.devices.set([
                    ...devices
                        .filter((device: DeviceType) => (
                            (device.where.length === 0) || (!device.where))
                        ),
                    ...(this.room().devices || [])
                ]);
                this.devicesLoading.set(false);
                console.log('devices arrivati');
                console.log(devices);
                console.log('fine log dei devices arrivati');
            })
            .catch((error: unknown) => {
                console.log('errore in loadDevices della nuova stanza');
                console.log(error);

                const candidate = error as {error?: {error?: string}; message?: string};
                this.devicesError.set(
                    candidate.error?.error ?? candidate.message ?? 'Impossibile caricare i dispositivi'
                );
                this.devicesLoading.set(false);
            });
    }



    setDevices(devices: DeviceType[]) {

        let devicesIds: number[] = [
                ...this.room().device_list
                    .split(',')
                    .map((id: string) => parseInt(id)),
                ...devices.map((device: DeviceType) => parseInt(''+ device.id))
            ]
                .map((id: number, index: number, list: number[]) => {
                    if(list.includes(id)) return 0;
                    return id;
                })
                .filter((id: number) => !!id)
                .sort((a: number, b: number) => a - b)
        ;
        let devicesIds_string: string = devicesIds.join(',');

        this.room.update((data: ZoneType) => ({
            ...data,
            device_list: devicesIds_string
            // devices: devicesIds
        }));
    }



    toggleSelctedDevice(device: DeviceType, event: CheckboxChangeEvent) {
        const current: DeviceType[] = this.room().devices ?? [];
        const devices: DeviceType[] =
            event.checked
                ? (this.isDeviceInRoom(device) ? current : [...current, device])
                : current.filter((d: DeviceType) => String(d.id) !== String(device.id))
                ;
        this.room.update((room: ZoneType) => ({
            ...room,
            devices: devices,
            device_list: devices.map((d: DeviceType) => d.id).join(',')
            }));
    }



    isDeviceInRoom(device: DeviceType): boolean {
        return (this.room()?.devices ?? [])
            .some((d: DeviceType) => String(d.id) === String(device.id));
    }


    itemEmojIcon(emojIconName: string) {
        if (!emojIconName) {
            // TODO
        }
        return emoj(emojIconName || '');
    }



    getMainChannel(device: DeviceSmallType): string {
        let d: DeviceType | undefined =
            (this.room()?.devices || [])
                .find((dd: DeviceType) => dd.id === device.id)
        ;
        let mainChannelText: string = '';
        console.log('contorllo se il dispostitivo esiste');
        console.log(d);
        console.log(device);
        if(!d) return mainChannelText;
        console.log('contorllo se il dispostitivo é anche un sensore');

        // d = extractRealDeviceType( d );
        // let powerChannelIndex: number =
        //     d.channel
        //         .map((ch: string, index: number) => (ch === 'power') ? index : -1)
        //         .filter((chIndex: number) => chIndex !== -1)
        //         .reduce(getLastElementOr, -1)
        // ;
        // if( powerChannelIndex !== -1 ) {
        //     // mainChannelText += d.channel[powerChannelIndex];
        //     mainChannelText += d.value[powerChannelIndex];
        //     mainChannelText += d.unit[powerChannelIndex];
        //
        //     // minThreshold: []
        //     // maxThreshold: []
        //
        // }
        //
        // /*
        // MeteredSwitchType
        //  */
        //
        // if( d.channel.reduce(getLastElementOr, null) === 'output' ) return ' ';
        // return (`${d.channel.reduce(getLastElementOr, null)}: ${d.status.reduce(getLastElementOr, null)}`);

        if (isSensorDevice(d)) {
            console.log('il dispostitivo é anche un sensore');
            const powerChannelIndex: number = d.channel.lastIndexOf('power');
            const power = (powerChannelIndex !== -1) ? d.value[powerChannelIndex] : null;
            if (power !== null && power !== undefined) {
                return `${power} ${d.unit?.[powerChannelIndex] ?? ''}`.trim();
            }
        }

        return mainChannelText;
    }

    getMainChannelLastTimeUpdated(device: DeviceSmallType): string {
        let d: DeviceType | undefined =
            (this.room()?.devices || [])
                .find((dd: DeviceType) => dd.id === device.id)
        ;
        if(!d) return '';
        return ''+ moment(d.lastTime.reduce(getLastElementOr, null)).format('DD/MM/YYYY HH:mm');
    }


    /**
     * valori possibili di ritorno:
     * -1 sotto la soglia minima
     * 0 entro le sooglie
     * +1 sopra la soglia massima
     * @param device
     */
    thresholdIndicator(device: DeviceSmallType){
        let d: DeviceType | undefined =
            this.devices()
                .find((dd: DeviceType) => dd.id === device.id)
        ;
        if(!d) return 0;

        if (isSensorDevice(d)) {
            const powerChannelIndex: number = d.channel.lastIndexOf('power');
            const power = (powerChannelIndex !== -1) ? (d.value[powerChannelIndex] || 0) : 0;
            if( !! d.minThreshold[powerChannelIndex] ) {
                if( power < d.minThreshold[powerChannelIndex] ) return -1;
            }
            if( !! d.maxThreshold[powerChannelIndex] ) {
                if( power > d.maxThreshold[powerChannelIndex] ) return 1;
            }
        }

        return 0;
    }



    wifiSignalInOpacityRange(device: DeviceSmallType) {


        if (!!device.signalStatus) {
            const wifiSignal: number = device.signalStatus;
            let wifiSignalPercent: number = Math.max(0, Math.min(100, 2 * (wifiSignal + 100)));
            if (wifiSignalPercent < 20) {
                wifiSignalPercent = 20;
            }
            if (wifiSignalPercent > 80) {
                wifiSignalPercent = 80;
            }
            return wifiSignalPercent / 100;
        }

        // RSSI non letto: il Core usa 0, valore impossibile per una misura in
        // dBm. L'indicatore resta invisibile invece di mostrare un segnale
        // intermedio mai misurato.
        return 0;
    }


    loadDevicesStatus(): Promise<void> {
        const now = Date.now();
        const devicesToRefresh = this.devices().filter(
            device => this.needsStatusRefresh(device, now)
        );

        if (devicesToRefresh.length === 0) {
            return Promise.resolve();
        }

        const waitingDeviceIds = new Set(
            devicesToRefresh.map(device => String(device.id))
        );
        this.isDeviceStatusInWaiting.update(waitingStates => (
            waitingStates.map(waitingState => ({
                ...waitingState,
                inWaiting: waitingDeviceIds.has(String(waitingState.id))
            }))
        ));

        // Ogni dispositivo ha la sua catena e aggiorna la propria riga appena
        // arriva la risposta, senza attendere gli altri. Il `Promise.all`
        // finale serve solo a sapere quando l'ultimo ha finito: le singole
        // catene gestiscono già errore e attesa, quindi non può mai rigettare.
        return Promise.all(
                devicesToRefresh.map(device => (
                    firstValueFrom(this.deviceApi.loadDeviceStatus(device.id))

                        .then((refreshed: DeviceType) => {
                            this.devices.update(devices => devices.map(current => (
                                String(current.id) === String(device.id)
                                    ? refreshed
                                    : current
                            )));
                        })

                        .catch((error: unknown) => {
                            console.error(
                                `Aggiornamento status del dispositivo ${device.id} non riuscito`,
                                error
                            );
                        })

                        // Anche l'attesa si chiude per singolo dispositivo.
                        .finally(() => {
                            this.isDeviceStatusInWaiting.update(waitingStates => (
                                waitingStates.map(waitingState => (
                                    String(waitingState.id) === String(device.id)
                                        ? {...waitingState, inWaiting: false}
                                        : waitingState
                                ))
                            ));
                        })
                ))
            )
            .then(() => undefined);
    }

    isCurrentDeviceStatusInWaiting(device: DeviceSmallType) {

        let deviceStatusWaiting = this.isDeviceStatusInWaiting().find((d) => d.id === device.id);
        if (!deviceStatusWaiting) {
            return false;
        } else {
            return deviceStatusWaiting.inWaiting;
        }
    }

    deviceChannelStatus(
        device: DeviceSmallType,
        channelKey: string
    ): DeviceType['status'][number] {
        const channelIndex = device.channel.indexOf(channelKey);
        return channelIndex === -1
            ? null
            : device.status[channelIndex] ?? null;
    }

    hasPermission(permission: string): boolean {
        return this.permissionService.hasPermission(permission);
    }



    private needsStatusRefresh(device: DeviceType, now: number): boolean {
        if (device.channel.length === 0) {
            return false;
        }

        // controllo mancanza status
        let statuses = JSON.parse(JSON.stringify(device.status.reverse()));
        if (!statuses.reduce(getLastElementOr, null)) {
            return true;
        }

        // controllo mancanza wifi
        if (!device.hardware.status.WiFi) {
            return true;
        }
        if (!device.hardware.status.WiFi.rssi) {
            return true;
        }

        // controllo tempo
        return device.channel.some((_channel, index) => {
            const lastReadAt = timestampInMilliseconds(device.lastTime[index]);
            return lastReadAt === null || now - lastReadAt >= DEVICE_STATUS_MAX_AGE_MS;
        });
    }



    isDeviceInWaiting(device: DeviceSmallType) {
        let waitingStatus: { id: number | string; inWaiting: boolean } | undefined =
            this.isDeviceStatusInWaiting()
                .find((waitForStatus: { id: number | string; inWaiting: boolean }) => waitForStatus.id === device.id)
        ;
        if (!!waitingStatus) {
            return waitingStatus.inWaiting;
        }
        return false;
    }


    switchAction(device: DeviceSmallType, event: any) {
        // TODO
    }


    editData() {
        this.isInEdit.update(() => !this.isInEdit());
        if(!!this.isInEdit()) {
            this.loadDevices();
        }
    }


    editRoom() {
        console.log('nuovi dati della stanza');
        console.log( this.room());
        this.inWaiting.update(() => true);



        firstValueFrom(this.roomsApi.editRoom( this.room() ))
            .then((room: ZoneType) => {

                this.room.set(room);

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

            this.room.update((data: ZoneType) => ({
                ...data,
                picture: reader.result as string
            }));
            // console.log( this.previewUrl );
            this.cdr.detectChanges();

        };

        reader.readAsDataURL(file);

    }
}
