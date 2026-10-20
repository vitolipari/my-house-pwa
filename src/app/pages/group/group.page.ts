import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {PageTitleComponent} from '../../components/page-title.component/page-title.component';
import {ActivatedRoute, Router} from '@angular/router';
import {DeviceSmallType, DeviceType, GroupType, isSensorDevice} from '../devices/devices.models';
import {firstValueFrom} from 'rxjs';
import {DeviceApiService} from '../devices/device-api';
import {GroupsApiService} from '../groups/groups-api';
import {getLastElementOr} from '../../utils/array-util';
import {emoj} from '../../utils/string-utils';
import {Button} from 'primeng/button';
import {InputText} from 'primeng/inputtext';
import {FormsModule} from '@angular/forms';
import {Checkbox, CheckboxChangeEvent} from 'primeng/checkbox';
import moment from 'moment';
import {DeviceBlockComponent} from '../../components/device-block/device-block.component/device-block.component';

@Component({
  selector: 'app-group.page',
    imports: [
        PageTitleComponent,
        Button,
        InputText,
        FormsModule,
        Checkbox,
        DeviceBlockComponent
    ],
  templateUrl: './group.page.html',
  styleUrl: './group.page.css',
})
export class GroupPage implements OnInit {

    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly deviceApi = inject(DeviceApiService);
    private readonly groupsApi = inject(GroupsApiService);

    readonly group = signal<GroupType>({id: 0, name: '', description: '', device_list: ''});
    readonly isInEdit = signal<boolean>(false);
    readonly groupDataLoading = signal(false);
    readonly devicesLoading = signal(false);
    readonly devices = signal<DeviceType[]>([]);   // tutti i dispositivi, per la modifica
    readonly devicesError = signal<string | null>(null);
    protected readonly inWaiting = signal<boolean>(false);

    readonly pathVariables = this.route.snapshot.params; // oggetto con i pathVariables
    readonly navigationData = this.router.currentNavigation()?.extras.state;    // passato dalla navigazione

    /**
     * I dispositivi del gruppo derivano da device_list e dall'elenco completo:
     * un dispositivo può stare in più gruppi, quindi non c'è un filtro lato Core.
     */
    readonly groupDevices = computed<DeviceType[]>(() => {
        const ids: string[] = this.groupDeviceIds();
        return this.devices().filter((device: DeviceType) => ids.includes(String(device.id)));
    });


    ngOnInit(): void {

        if( !!this.navigationData && !!this.navigationData['details'] ) {
            this.group.set( this.navigationData['details'] as GroupType );
            void this.loadDevices();
            return;
        }

        // i dati del gruppo non sono arrivati dalla navigazione interna
        console.log('dati del gruppo assenti, parte la chiamata');
        this.groupDataLoading.set(true);

        firstValueFrom(this.groupsApi.searchGroups({id: parseInt(this.pathVariables['id'])}))
            .then((groups: GroupType[]) => {
                console.log('caricati i dati del gruppo '+ this.pathVariables['id']);
                const found: GroupType | null = groups.reduce(getLastElementOr, null);
                if (!!found) {
                    this.group.set(found);
                }
                this.groupDataLoading.set(false);
                return this.loadDevices();
            })
            .catch((error: unknown) => {
                console.log('errore in ngOnInit della pagina del gruppo');
                console.log(error);
                this.groupDataLoading.set(false);
            });
    }


    loadDevices(): Promise<void> {
        this.devicesLoading.set(true);
        this.devicesError.set(null);

        return firstValueFrom(this.deviceApi.list())
            .then((devices: DeviceType[]) => {
                console.log('arrivati i dispositivi per la pagina del gruppo');
                this.devices.set(devices);
                this.devicesLoading.set(false);
            })
            .catch((error: unknown) => {
                console.log('errore in loadDevices della pagina del gruppo');
                console.log(error);

                const candidate = error as {error?: {error?: string}; message?: string};
                this.devicesError.set(
                    candidate.error?.error ?? candidate.message ?? 'Impossibile caricare i dispositivi'
                );
                this.devicesLoading.set(false);
            });
    }


    private groupDeviceIds(): string[] {
        return (this.group().device_list || '')
            .split(',')
            .map((id: string) => id.trim())
            .filter((id: string) => !!id);
    }

    isDeviceInGroup(device: DeviceType): boolean {
        return this.groupDeviceIds().includes(String(device.id));
    }

    toggleSelctedDevice(device: DeviceType, event: CheckboxChangeEvent) {
        const ids: string[] = this.groupDeviceIds().filter((id: string) => id !== String(device.id));
        if (!!event.checked) {
            ids.push(String(device.id));
        }
        this.group.update((group: GroupType) => ({
            ...group,
            device_list: ids.join(',')
        }));
    }

    // group si aggiorna sempre con un oggetto nuovo, altrimenti il signal non notifica
    setName(name: string) {
        this.group.update((group: GroupType) => ({...group, name}));
    }

    setDescription(description: string) {
        this.group.update((group: GroupType) => ({...group, description}));
    }


    itemEmojIcon(emojIconName: string) {
        return emoj(emojIconName || '');
    }

    getMainChannel(device: DeviceSmallType): string {

        let d: DeviceType | undefined =
            this.devices()
                .find((dd: DeviceType) => dd.id === device.id)
        ;
            // (this.group()?.device_list.split(',') || [])
            //     .filter((x: any) => !!x)
            //     .map((id: string) => parseInt(''+ id))
            //     .find((dd: DeviceType) => dd.id === device.id)
        ;
        let mainChannelText: string = '';
        console.log('contorllo se il dispostitivo esiste');
        console.log(d);
        console.log(device);
        console.log(this.group()?.devices);
        console.log(this.group());
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
            this.devices()
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


    editData() {
        this.isInEdit.update(() => !this.isInEdit());
    }


    editGroup() {
        console.log('nuovi dati del gruppo');
        console.log( this.group());
        this.inWaiting.set(true);

        const {devices, ...groupData} = this.group();

        firstValueFrom(this.groupsApi.editGroup( groupData as GroupType ))
            .then((group: GroupType) => {
                this.inWaiting.set(false);
                this.router.navigate(['devices-page'], {
                    queryParams: {},
                    state: {
                        tab: 'groups',
                        details: group
                    }
                });
            })
            .catch((error: unknown) => {
                console.log('errore in editGroup');
                console.log(error);

                const candidate = error as {error?: {error?: string}; message?: string};
                this.devicesError.set(
                    candidate.error?.error ?? candidate.message ?? 'Impossibile salvare il gruppo'
                );
                this.inWaiting.set(false);
            });
    }
}
