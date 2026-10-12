import {ChangeDetectorRef, Component, computed, effect, inject, OnInit, signal} from '@angular/core';
import {PageTitleComponent} from '../../components/page-title.component/page-title.component';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {SwitcherComponent} from '../../components/switcher/switcher.component';
import {DeviceSmallType, DeviceType, ZoneType} from '../devices/devices.models';
import {firstValueFrom} from 'rxjs';
import {DeviceApiService} from '../devices/device-api';
import {emoj} from '../../utils/string-utils';
import {InputText} from 'primeng/inputtext';
import {Button, ButtonModule} from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import {
    DeviceIpBlockComponent,
    NetworkIdentity
} from '../../components/device-ip-block.component/device-ip-block.component';
import {Listbox} from 'primeng/listbox';
import {RoomsApiService} from '../rooms/rooms-api';
import {Router} from '@angular/router';
import {Checkbox, CheckboxChangeEvent, CheckboxModule} from 'primeng/checkbox';



@Component({
  selector: 'app-new-room.page',
    imports: [
        PageTitleComponent,
        FormsModule,
        InputText,
        ReactiveFormsModule,
        SwitcherComponent,
        DeviceIpBlockComponent,
        Listbox,
        Button,
        Checkbox
    ],
  templateUrl: './new-room.page.html',
  styleUrl: './new-room.page.css',
})
export class NewRoomPage implements OnInit {

    // constant

    // variables
    selectedDevices: DeviceType[] = [];

    // signals
    readonly data = signal<ZoneType>({
        id: 0,
        name: '',
        picture: '',
        device_list: ''
    });
    readonly errors = signal<{name:string; picture: string, devices: number[];} | null>(null);
    readonly devices = signal<DeviceType[]>([]);
    readonly devicesLoading = signal(true);
    readonly devicesError = signal<string | null>(null);
    protected readonly isReadyToSet = computed(() => (
        this.data().name.trim().length > 0
        // && this.data().devices.length > 0
    ));
    protected readonly isSavingInWait = signal<boolean>(false);


    // services
    private readonly deviceApi = inject(DeviceApiService);
    private readonly roomsApi = inject(RoomsApiService);
    private readonly router = inject(Router);




    ngOnInit(): void {
        console.log('new room on Init');
        // void this.loadOwnDevices();
    }

    constructor(private cdr: ChangeDetectorRef) {
        // richiamata a ogni nuovo valore di data
        effect(() => {
            const data: ZoneType = this.data();
            console.log('dati della nuova stanza cambiati');
            console.log(data);
        });

        void this.loadDevices();
    }

    loadDevices(): Promise<void> {
        this.devicesLoading.set(true);
        this.devicesError.set(null);

        return firstValueFrom(this.deviceApi.list())
            .then((devices: DeviceType[]) => {
                this.devices.set(
                    devices.filter((device: DeviceType) => ((device.where.length === 0) || (!device.where)))
                );
                this.devicesLoading.set(false);
                console.log('devices arrivati');
                console.log(devices);
            })
            .catch((error: unknown) => {
                console.log('errore in loadOwnDevices della nuova stanza');
                console.log(error);

                const candidate = error as {error?: {error?: string}; message?: string};
                this.devicesError.set(
                    candidate.error?.error ?? candidate.message ?? 'Impossibile caricare i dispositivi'
                );
                this.devicesLoading.set(false);
            });
    }

    itemEmojIcon( emojIconName: string) {
        if( !emojIconName ) {
            // TODO
        }
        return emoj( emojIconName || '' );
    }


    wifiSignalInOpacityRange(device: DeviceSmallType) {


        if(!!device.signalStatus) {
            const wifiSignal: number = device.signalStatus;
            let wifiSignalPercent: number = Math.max(0, Math.min(100, 2 * (wifiSignal + 100)));
            if( wifiSignalPercent < 20) {
                wifiSignalPercent = 20;
            }
            if( wifiSignalPercent > 80) {
                wifiSignalPercent = 80;
            }
            return wifiSignalPercent/100;
        }

        // RSSI non letto: il Core usa 0, valore impossibile per una misura in
        // dBm. L'indicatore resta invisibile invece di mostrare un segnale
        // intermedio mai misurato.
        return 0;
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


    // data si aggiorna sempre con un oggetto nuovo, altrimenti il signal non notifica
    protected setName(name: string) {
        this.data.update((data: ZoneType) => ({...data, name}));
    }

    protected setDevices(devices: DeviceType[]) {

        let devicesIds: number[] = [
                ...this.data().device_list
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

        this.data.update((data: ZoneType) => ({
            ...data,
            device_list: devicesIds_string
            // devices: devicesIds
        }));
    }

    protected onImageSelected(event: Event) {
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

            this.data.update((data: ZoneType) => ({
                ...data,
                picture: reader.result as string
            }));
            // console.log( this.previewUrl );
            this.cdr.detectChanges();

        };

        reader.readAsDataURL(file);

    }

    protected addNewRoom() {
        console.log(`name: ${ this.data().name }`);
        console.log(this.data());

        return firstValueFrom(this.roomsApi.newRoom(this.data()))
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

    protected toggleSelctedDevice(device: DeviceType, event: CheckboxChangeEvent) {

        if( !!event.checked ) {
            this.selectedDevices = [...this.selectedDevices, device];
        }
        else {
            this.selectedDevices =
                this.selectedDevices
                    .filter((sd: DeviceType) => sd.id !== device.id)
            ;
        }
        this.data.update(() => ({
            ...this.data(),
            devices: this.selectedDevices,
            device_list: this.selectedDevices.map((device: DeviceType) => device.id).join(',')
        }));
    }
}
