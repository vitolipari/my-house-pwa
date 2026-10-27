import {CommonModule, formatDate} from '@angular/common';
import {Component, computed, inject, ModelSignal, OnDestroy, OnInit, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {firstValueFrom} from 'rxjs';
import {
    DeviceCatalogItem, DeviceSmallType,
    DeviceType, extractRealDeviceType, GroupType, isSensorDevice,
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
import {GroupsApiService} from '../groups/groups-api';
import {LongPressDirective} from '../../directives/long-press.directive';
import {Checkbox, CheckboxChangeEvent} from 'primeng/checkbox';
import {Button} from 'primeng/button';
import {DeviceBlockComponent} from '../../components/device-block/device-block.component/device-block.component';

export const DEVICE_STATUS_MAX_AGE_MS = 60_000;


@Component({
    selector: 'devices-page',
    standalone: true,
    imports: [
        CommonModule
        , FormsModule
        // , UserBlockComponent
        , DeviceIpBlockComponent
        , DeviceBlockComponent
        , Tabs
        , TabList
        , TabPanel
        , TabPanels
        , Tab
        , PageTitleComponent
        // , SwitcherComponent
        , LongPressDirective
        , Checkbox
        , Button, SwitcherComponent
    ],
    templateUrl: './devices.page.html',
    styleUrls: ['../../../page.css', './devices.page.css']
})
export class DevicesPage implements OnInit {


    isInWaiting = signal(true);
    isInScanning = signal(true);
    isGroupActionInWaiting = signal<{grid: number; isOn: boolean}[]>([]);
    deviceDataTreePanelOpen = signal<DeviceType | null>(null);
    isCopied = signal<boolean>(false);
    ipDevices: NetworkIdentity[] = [];
    readonly devices = signal<DeviceType[]>([]);
    // readonly devicesInList = signal<DeviceSmallType[]>([]);
    readonly devicesLoading = signal(true);
    readonly devicesError = signal<string | null>(null);
    // readonly isDeviceStatusInWaiting = signal<{ id: number | string; inWaiting: boolean }[]>([{
    //     id: 0,
    //     inWaiting: false
    // }]);

    value: string | number = "device";


    // gruppi
    selectedGroups: GroupType[] = [];
    readonly groups = signal<GroupType[]>([]);
    readonly groupsLoading = signal(true);
    readonly groupsError = signal<string | null>(null);
    readonly isGroupsInSelection = signal<boolean>(false);
    readonly isGroupsDeleteInWaiting = signal<boolean>(false);

    private readonly api = inject<ApiUrlService>(ApiUrlService);
    private readonly deviceApi = inject(DeviceApiService);
    private router = inject(Router);
    private readonly groupsApi = inject(GroupsApiService);
    readonly navigationData = this.router.currentNavigation()?.extras.state;    // passato dalla navigazione
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
    readonly deviceZones = computed<{ room: ZoneType, devices: DeviceType[] }[]>(() => {
        const groups: { room: ZoneType, devices: DeviceType[] }[] = [{
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
                    // group.devices.push(this.toSmallDevice(device));
                    group.devices.push(device);
                    return;
                }

                if( device.where.every((w: ZoneType) => w.id !== -1) ) {
                    groups.push({room, devices: [device]});
                }
            });

            device.where
                .filter((zone: ZoneType) => zone.id === -1)
                .forEach(() => {
                    groups[0].devices.push(device);
                })
            ;
            if(device.where.length === 0) {
                groups[0].devices.push(device);
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
        // dalle pagine dei gruppi si torna direttamente sul tab dei gruppi
        if (this.navigationData?.['tab'] === 'groups') {
            this.value = 'groups';
        }
        void this.loadDevices();
        void this.loadGroups();
    }



    private loadDevices(): Promise<void> {
        this.devicesLoading.set(true);
        this.devicesError.set(null);

        return firstValueFrom(this.deviceApi.list())
            .then((devices: DeviceType[]) => {

                console.log('devices arrivati');
                console.log(devices);

                // `deviceZones` è derivato da `devices`: non va costruito qui.
                this.devices.set(devices);




                this.devicesLoading.set(false);


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

    addGroup() {
        this.router.navigate(
            ['/new-group'],
            {
                state: {
                    from: 'devicesPage'
                }
            }
        );
    }

    // il pulsante + del titolo crea un gruppo sul tab dei gruppi, altrimenti un dispositivo
    addFromTitle() {
        if (this.value === 'groups') {
            this.addGroup();
            return;
        }
        this.addDevice();
    }

    private loadGroups(): Promise<void> {
        this.groupsLoading.set(true);
        this.groupsError.set(null);

        return firstValueFrom(this.groupsApi.searchGroups())
            .then((groups: GroupType[]) => {
                console.log('gruppi arrivati');
                console.log(groups);



                // cicle per gruppo
                groups
                    .map((gr: GroupType) => [gr, gr.device_list.split(',')] as [GroupType, string[]])
                    .map(([gr, d]) => [gr, d.map((did: string) => parseInt(did))] as [GroupType, number[]])
                    .map(([gr, did]) => {

                        let groupStatusList: {channel: string, values: number[]}[] = [];
                        did
                            .map((dd: number) => this.devices().find((d: DeviceType) => parseInt('' + d.id) === dd))
                            .filter((x: DeviceType | null | undefined) => !!x)
                            .forEach((dev: DeviceType) => {

                                // tutti i dispositivi del gruppo corrente
                                // raccogliere la lista dei tipi di status
                                // in base a channel[], status[], type.id
                                const channels = ['power', 'temperature', 'humidity', 'output'];

                                dev.channel
                                    .filter((devCh: string)=> channels.includes(devCh))
                                    .forEach((devCh: string) => {
                                        let currentStatus = groupStatusList.find((status: {channel: string, values: number[]}) => status.channel === devCh);
                                        let currentValue =
                                            (!!dev.status[dev.channel.lastIndexOf( devCh )] && !isNaN(parseFloat(''+ dev.status[dev.channel.lastIndexOf( devCh )])))
                                                ? parseFloat(''+ dev.status[dev.channel.lastIndexOf( devCh )])
                                                : 0
                                        ;
                                        if( !!currentStatus ) {
                                            currentStatus.values = [...currentStatus.values, currentValue];
                                        }
                                        else {
                                            groupStatusList.push({channel: devCh, values: [currentValue]});
                                        }
                                    })
                                ;

                                // return groupStatusList;

                            })
                        ;
                        gr.statusList =
                            groupStatusList
                                .map((currentStatus: {channel: string, values: number[]}) => {
                                    let average = currentStatus.values.reduce((average, value) => average + value, 0) / currentStatus.values.length;
                                    return {channel: currentStatus.channel, averageValue: average}
                                })
                        ;

                        // console.log('groupStatusList');
                        // console.log(gr);
                    })









                this.groups.set(
                    groups.map((group: GroupType) => ({
                        ...group,
                        device_list: group.device_list || ''
                    }))
                );
                this.groupsLoading.set(false);
            })
            .catch((error: unknown) => {
                console.log('errore in loadGroups della pagina dispositivi');
                console.log(error);

                const candidate = error as { error?: { error?: string }; message?: string };
                this.groupsError.set(
                    candidate.error?.error ?? candidate.message ?? 'Impossibile caricare i gruppi'
                );
                this.groupsLoading.set(false);
            });
    }

    groupDeviceCount(group: GroupType): number {
        return (group.device_list || '')
            .split(',')
            .filter((id: string) => !!id.trim())
            .length;
    }

    gotoDetailsGroup(group: GroupType) {
        this.router.navigate(['group-page', group.id], {
            queryParams: {},
            state: {
                details: group
            }
        });
    }

    onGroupLongPress(group: GroupType) {
        console.log('inizio della selezione dei gruppi');
        this.isGroupsInSelection.set(true);
    }

    toggleSelectedGroup(group: GroupType, event: CheckboxChangeEvent) {
        this.selectedGroups =
            this.selectedGroups.filter((selected: GroupType) => selected.id !== group.id);
        if (!!event.checked) {
            this.selectedGroups.push(group);
        }
    }

    // A differenza delle stanze si resta sulla pagina: la lista si ricarica
    // e la selezione si chiude.
    deleteMultiGroup() {
        if (this.selectedGroups.length === 0) {
            this.isGroupsInSelection.set(false);
            return;
        }
        this.isGroupsDeleteInWaiting.set(true);

        firstValueFrom(this.groupsApi.deleteGroups(this.selectedGroups))
            .then(() => {
                this.selectedGroups = [];
                this.isGroupsInSelection.set(false);
                this.isGroupsDeleteInWaiting.set(false);
                return this.loadGroups();
            })
            .catch((error: unknown) => {
                console.log('errore in deleteMultiGroup');
                console.log(error);
                this.isGroupsDeleteInWaiting.set(false);
            });
    }

    cancelGroupsSelection() {
        this.selectedGroups = [];
        this.isGroupsInSelection.set(false);
    }

    // Il click sulla checkbox non deve arrivare alla riga (apertura del gruppo).
    // Niente preventDefault: sulla checkbox annullerebbe il cambio di stato.
    stopPropagation(event: MouseEvent) {
        event.stopPropagation();
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


    protected goToMatterPage() {
        this.router.navigate(['matter-bridge'], {
            queryParams: { from: 'devices-page' },
            state: {}
        });
    }

    groupOutputStatus(group: GroupType) {
        let outputStatus = (group.statusList || []).find((status: any) => status.channel === 'output');
        return !!outputStatus?.averageValue;
    }


    isGroupOutputStatusInWaiting(group: GroupType) {
        return false; // TODO da gestire
    }


    switchGroupAction(group: GroupType, isToCheck: boolean) {

        this.isGroupActionInWaiting().find((item: {grid: number; isOn: boolean}) => item.grid === group.id)

        Promise.allSettled(
            group.device_list
                .split(',')
                .filter((deviceId: string) => !!deviceId)
                .map((deviceId: string) => parseInt(deviceId))
                .map((deviceId: number) => firstValueFrom(this.deviceApi.deviceAction(deviceId, 'output', isToCheck ? 'POWER:ON' : 'POWER:OFF')) )
        )
            .then((resultList: PromiseSettledResult<any>[]) => {
                resultList.forEach((result: PromiseSettledResult<any>) => {
                    if (result.status === 'fulfilled') {
                        console.log('Device action successful');
                    } else {
                        console.error('Device action failed');
                    }
                });
            })


    }
}
