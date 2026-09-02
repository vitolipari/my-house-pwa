import {CommonModule} from '@angular/common';
import {Component, computed, inject, ModelSignal, OnDestroy, OnInit, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {firstValueFrom} from 'rxjs';
import {
    DeviceCatalogItem, DeviceSmallType,
    DeviceType,
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
import { PermissionService } from '../../services/permission.service';
import {DarkModeService} from '../../services/dark-mode-service';
import {emoj} from '../../utils/string-utils';
import {SwitcherComponent} from '../../components/switcher/switcher.component';
import {timestampInMilliseconds} from '../../utils/time-utils';

const DEVICE_STATUS_MAX_AGE_MS = 60_000;


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
    readonly deviceGroups = signal<{room: ZoneType, devices: DeviceSmallType[]}[]>([]);
    readonly devices = signal<DeviceType[]>([]);
    // readonly devicesInList = signal<DeviceSmallType[]>([]);
    readonly devicesLoading = signal(true);
    readonly devicesError = signal<string | null>(null);
    readonly isDeviceStatusInWaiting = signal<{id: number | string; inWaiting: boolean}[]>([{id: 0, inWaiting: false}]);

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

    ngOnInit(): void {
        void this.loadDevices();
    }

    itemEmojIcon( emojIconName: string) {
        if( !emojIconName ) {
            // TODO
        }
        return emoj( emojIconName || '' );
    }

    private loadDevices(): Promise<void> {
        this.devicesLoading.set(true);
        this.devicesError.set(null);

        return firstValueFrom(this.deviceApi.list())
            .then((devices: DeviceType[]) => {
                this.devices.set(devices);

                let groupByRoom: {room: ZoneType, devices: DeviceSmallType[]}[] = [{
                    room: {id: 0, name: 'No-ROOM', picture: ''},
                    devices: []
                }];

                this.devices()
                    .map((device: DeviceType) => {
                        let elementInGroupByRoom: {room: ZoneType, devices: DeviceSmallType[]} | undefined = groupByRoom.find((gbr) => (gbr.room.id === device.where.id));
                        if( !!elementInGroupByRoom ) {
                            elementInGroupByRoom
                                .devices
                                .push({
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
                                })
                        }
                        else {
                            groupByRoom.push({
                                room: device.where,
                                devices: [{
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
                                }]
                            })
                        }

                        return device;
                    })
                    .forEach((device: DeviceType) => {
                        // forse non serve
                    })

                this.deviceGroups.set(groupByRoom);


                this.isDeviceStatusInWaiting.set(
                    devices
                        .map((device: DeviceType) => ({id: device.id, inWaiting: false}))
                )
                ;
                this.devicesLoading.set(false);

				return this.loadDevicesStatus();
            })
            .catch((error: unknown) => {
                const candidate = error as {error?: {error?: string}; message?: string};
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

        return Promise.allSettled(
            devicesToRefresh.map(device => (
                firstValueFrom(this.deviceApi.loadDeviceStatus(device.id))
            ))
        )
            .then(results => {
                const refreshedDevices = new Map<string, DeviceType>();

                results.forEach((result, index) => {
                    const requestedDevice = devicesToRefresh[index];

                    if (result.status === 'fulfilled') {
                        refreshedDevices.set(
                            String(requestedDevice.id),
                            result.value
                        );
                        console.log('status');
                        console.log(result.value);

                        return;
                    }

                    console.error(
                        `Aggiornamento status del dispositivo ${requestedDevice.id} non riuscito`,
                        result.reason
                    );
                });

                this.devices.update(devices => (
                    devices.map(device => (
                        refreshedDevices.get(String(device.id)) ?? device
                    ))
                ));

                this.deviceGroups()
                    .forEach((group: {room: ZoneType, devices: DeviceSmallType[]}) => {
                        group.devices =
                            group
                                .devices
                                .map((d: DeviceSmallType) => {
                                    let findedDevice = this.devices().find((D: DeviceType) => (D.id === d.id));
                                    d = {
                                        id: !!findedDevice ? findedDevice.id : d.id,
                                        family: !!findedDevice ? findedDevice.family : d.family,
                                        name: !!findedDevice ? findedDevice.name : d.name,
                                        ip: !!findedDevice ? findedDevice.ip : d.ip,
                                        mac: !!findedDevice ? findedDevice.mac : d.mac,
                                        where: !!findedDevice ? findedDevice.where : d.where,
                                        signalStatus: !!findedDevice ? findedDevice.signalStatus : d.signalStatus,
                                        catalogItemId: !!findedDevice ? findedDevice.catalogItemId : d.catalogItemId,
                                        type: !!findedDevice ? findedDevice.type : d.type,
                                        category: !!findedDevice ? findedDevice.category : d.category,
                                        svgIcon: !!findedDevice ? findedDevice.svgIcon : d.svgIcon,
                                        emoj: !!findedDevice ? findedDevice.emoj : d.emoj,
                                        imgIcon: !!findedDevice ? findedDevice.imgIcon : d.imgIcon,
                                        channel: !!findedDevice ? findedDevice.channel : d.channel,
                                        status: !!findedDevice ? findedDevice.status : d.status,
                                        lastTime: !!findedDevice ? findedDevice.lastTime : d.lastTime
                                    }
                                    return d;
                                })
                        ;
                    })




            })
            .finally(() => {
                this.isDeviceStatusInWaiting.update(waitingStates => (
                    waitingStates.map(waitingState => (
                        waitingDeviceIds.has(String(waitingState.id))
                            ? {...waitingState, inWaiting: false}
                            : waitingState
                    ))
                ));
            });
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
        if( this.ipDevices.length === 0 ) {
            firstValueFrom(this.api.netScan())
                .then((result: NetworkIdentity[]) => {

                    // TODO filtrare per i dispositivi già presenti

                    console.log('response di getUsers');
                    console.log(result);

                    this.ipDevices = result;
                    this.isInScanning.set(false);


                })
                .catch((e: any) => {
                    console.log('errore al get users in devices.page')
                    console.log(e);
                    debugger;
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
            navigator.clipboard.writeText( JSON.stringify(this.deviceDataTreePanelOpen()) )
                .then(() => {
                    this.isCopied.set(true);
                })
                .catch((e: any) => {
                    console.log('errore nella copia');
                    console.error(e);
                })
            ;

        } catch (error) {
            console.error('Errore durante la copia:', error);
        }
    }

    gotoDeviceDetailsPage(id: number | string) {
        // TODO controllo permesso
        this.router.navigate(
            [`/device-details/${ id }`],
            {
                state: {
                    from: 'mobileMenu',
                    device: this.devices().find((dev: DeviceType) => (dev.id === id))
                }
            }
        );

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


    switchAction(device: DeviceSmallType, event: any) {
        // TODO
    }


    isDeviceInWaiting(device: DeviceSmallType) {
        let waitingStatus: {id: number | string; inWaiting: boolean} | undefined =
            this.isDeviceStatusInWaiting()
                .find((waitForStatus: {id: number | string; inWaiting: boolean}) => waitForStatus.id === device.id)
        ;
        if( !!waitingStatus ) {
            return waitingStatus.inWaiting;
        }
        return false;
    }
}
