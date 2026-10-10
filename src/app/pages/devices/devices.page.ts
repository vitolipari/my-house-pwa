import {CommonModule, formatDate} from '@angular/common';
import {Component, computed, inject, ModelSignal, OnDestroy, OnInit, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {firstValueFrom} from 'rxjs';
import {
    DeviceCatalogItem, DeviceSmallType,
    DeviceType, extractRealDeviceType, isSensorDevice,
    ShellyFamilyType, ZoneType
} from './devices.models';
import {AuthService} from '../../services/auth';
import {DeviceApiService} from './device-api';
import {UserBlockComponent} from "../../components/user-block.component/user-block.component";
import {ApiUrlService} from '../../services/api-url-service';
import {
    DeviceIpBlockComponent,
    NetworkIdentity
} from '../../components/device-ip-block.component/device-ip-block.component';
import {Tab, TabList, TabPanel, TabPanels, Tabs, TabsModule} from 'primeng/tabs';
import {PageTitleComponent} from '../../components/page-title.component/page-title.component';
import {Router} from '@angular/router';
import {PermissionService} from '../../services/permission.service';
import {DarkModeService} from '../../services/dark-mode-service';
import {emoj} from '../../utils/string-utils';
import {SwitcherComponent} from '../../components/switcher/switcher.component';
import {timestampInMilliseconds} from '../../utils/time-utils';
import {getLastElementOr} from '../../utils/array-util';
import moment from 'moment';

export const DEVICE_STATUS_MAX_AGE_MS = 60_000;


@Component({
    selector: 'devices-page',
    standalone: true,
    imports: [CommonModule, FormsModule, UserBlockComponent, DeviceIpBlockComponent, Tabs, TabList, TabPanel, TabPanels, Tab, PageTitleComponent, SwitcherComponent],
    templateUrl: './devices.page.html',
    styleUrls: ['../../../page.css', './devices.page.css']
})
export class DevicesPage implements OnInit {

    isInWaiting = signal(true);
    isInScanning = signal(true);
    deviceDataTreePanelOpen = signal<DeviceType | null>(null);
    isCopied = signal<boolean>(false);
    ipDevices: NetworkIdentity[] = [];
    readonly devices = signal<DeviceType[]>([]);
    // readonly devicesInList = signal<DeviceSmallType[]>([]);
    readonly devicesLoading = signal(true);
    readonly devicesError = signal<string | null>(null);
    readonly isDeviceStatusInWaiting = signal<{ id: number | string; inWaiting: boolean }[]>([{
        id: 0,
        inWaiting: false
    }]);

    value: string | number = "device";

    private readonly api = inject<ApiUrlService>(ApiUrlService);
    private readonly deviceApi = inject(DeviceApiService);
    private router = inject(Router);
    private readonly permissionService = inject(PermissionService);
    private readonly darkModeService = inject(DarkModeService);

    readonly lockedImage = computed(() =>
        this.darkModeService.isDarkMode()
            ? 'assets/images/white_locked.png'
            : 'assets/images/locked.png'
    );

    /**
     * I gruppi per stanza sono una derivazione di `devices`: si ricalcolano da
     * soli a ogni aggiornamento, anche quando riguarda un solo dispositivo.
     * Non vanno quindi scritti a mano, altrimenti la lista mostrata resta
     * indietro rispetto ai dati.
     */
    readonly deviceGroups = computed<{ room: ZoneType, devices: DeviceSmallType[] }[]>(() => {
        const groups: { room: ZoneType, devices: DeviceSmallType[] }[] = [{
            room: {
                id: 0,
                name: 'Nessuna Stanza',
                device_list: '',
                picture: ''
            },
            devices: [],
        }];

        this.devices().forEach((device: DeviceType) => {

            // senza zone il dispositivo finisce nel gruppo No-ROOM
            // const rooms = device.where.length > 0 ? device.where : [groups[0].room];
            const rooms = device.where;

            rooms.forEach((room: ZoneType) => {
                const group = groups.find(current => current.room.id === room.id);

                if (group) {
                    group.devices.push(this.toSmallDevice(device));
                    return;
                }

                if( device.where.every((w: ZoneType) => w.id !== -1) ) {
                    groups.push({room, devices: [this.toSmallDevice(device)]});
                }
            });

            device.where
                .filter((zone: ZoneType) => zone.id === -1)
                .forEach(() => {
                    groups[0].devices.push(this.toSmallDevice(device));
                })
            ;
            if(device.where.length === 0) {
                groups[0].devices.push(this.toSmallDevice(device));
            }

        });

        return groups;
    });

    private toSmallDevice(device: DeviceType): DeviceSmallType {
        return {
            id: device.id,
            family: device.family,
            name: device.name,
            ip: device.ip,
            mac: device.mac,
            where: device.where,
            signalStatus: device.signalStatus,
            catalogItemId: device.catalogItemId,
            type: device.type,
            category: device.category,
            svgIcon: device.svgIcon,
            emoj: device.emoj,
            imgIcon: device.imgIcon,
            channel: device.channel,
            status: device.status,
            lastTime: device.lastTime
        };
    }

    ngOnInit(): void {
        void this.loadDevices();
    }

    itemEmojIcon(emojIconName: string) {
        if (!emojIconName) {
            // TODO
        }
        return emoj(emojIconName || '');
    }

    private loadDevices(): Promise<void> {
        this.devicesLoading.set(true);
        this.devicesError.set(null);

        return firstValueFrom(this.deviceApi.list())
            .then((devices: DeviceType[]) => {

                console.log('devices arrivati');
                console.log(devices);

                // `deviceGroups` è derivato da `devices`: non va costruito qui.
                this.devices.set(devices);

                this.isDeviceStatusInWaiting.set(
                    devices
                        .map((device: DeviceType) => ({id: device.id, inWaiting: false}))
                )
                ;
                this.devicesLoading.set(false);

                return this.loadDevicesStatus();
            })
            .catch((error: unknown) => {
                console.log('errore in loadOwnDevices');
                console.log(error);

                const candidate = error as { error?: { error?: string }; message?: string };
                this.devicesError.set(
                    candidate.error?.error ?? candidate.message ?? 'Impossibile caricare i dispositivi'
                );
                this.devicesLoading.set(false);
            });
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


    /**
     * questa funziona può essere avviata solo se si ha il permesso adatto
     */
    startScan() {

        if (!this.hasPermission('READ_NETWORK_DEVICES')) {
            return;
        }

        // controllo se gia e stato avviato
        if (this.ipDevices.length === 0) {
            firstValueFrom(this.api.netScan())
                .then((result: NetworkIdentity[]) => {


                    console.log('response di getUsers');
                    console.log(result);

                    this.ipDevices = result;
                    this.isInScanning.set(false);


                })
                .catch((e: any) => {
                    console.log('errore in startScan');
                    console.log(e);
                    this.isInWaiting.set(false);
                    // TODO mostrare messaggio di errore
                })
        }


    }


    addDevice() {
        this.router.navigate(
            ['/new-device'],
            {
                state: {
                    from: 'devicesPage'
                }
            }
        );
    }

    activeTab(tabName: string) {
        this.value = tabName;
        // console.log('tab cliccato: '+ tabName);
        // console.log('value: '+ this.value);
    }

    openNewDeviceDateTree(device: DeviceType) {
        this.deviceDataTreePanelOpen.set(device);
    }

    newDeviceDataTreePanelClose() {
        this.deviceDataTreePanelOpen.set(null);
    }


    copyNewDeviceData(event: PointerEvent) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        event.preventDefault();

        try {
            navigator.clipboard.writeText(JSON.stringify(this.deviceDataTreePanelOpen()))
                .then(() => {
                    this.isCopied.set(true);
                })
                .catch((e: any) => {
                    console.log('errore in copyNewDeviceData');
                    console.log(e);
                })
            ;

        } catch (error) {
            console.log('errore sincrono in copyNewDeviceData');
            console.log(error);
        }
    }

    gotoDeviceDetailsPage(id: number | string) {
        // TODO controllo permesso
        this.router.navigate(
            [`/device-details/${id}`],
            {
                state: {
                    from: 'mobileMenu',
                    device: this.devices().find((dev: DeviceType) => (dev.id === id))
                }
            }
        );

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


    switchAction(device: DeviceSmallType, event: any) {
        // TODO
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


    // get deviceTypeIcon(device: DeviceType): string {
    //
    //     // gestione del tipo
    //     switch (device.deviceType) {
    //         case null:
    //         case '':
    //             return '';
    //         case 'IoT device':
    //             return 'icon-209';
    //     }
    //
    //     return "";
    //
    // }

    getMainChannel(device: DeviceSmallType): string {
        let d: DeviceType | undefined =
            this.devices()
                .find((dd: DeviceType) => dd.id === device.id)
        ;
        let mainChannelText: string = '';
        if(!d) return mainChannelText;

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





}
