import {CommonModule} from '@angular/common';
import {Component, computed, inject, ModelSignal, OnDestroy, OnInit, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {firstValueFrom} from 'rxjs';
import {
    AddDeviceRequest,
    CommissioningJob,
    DeviceIntegrationStatus,
    DeviceProtocol,
    DeviceRecord,
    DiscoveredDevice
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


@Component({
    selector: 'devices-page',
    standalone: true,
    imports: [CommonModule, FormsModule, UserBlockComponent, DeviceIpBlockComponent, Tabs, TabList, TabPanel, TabPanels, Tab, PageTitleComponent],
    templateUrl: './devices.page.html',
    styleUrls: ['../../../page.css', './devices.page.css']
})
export class DevicesPage implements OnInit {

    isInWaiting = signal(true);
    isInScanning = signal(true);
    ipDevices: NetworkIdentity[] = [];
    readonly devices = signal<DeviceRecord[]>([]);
    readonly devicesLoading = signal(true);
    readonly devicesError = signal<string | null>(null);

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

    private async loadDevices(): Promise<void> {
        this.devicesLoading.set(true);
        this.devicesError.set(null);
        try {
            this.devices.set(await firstValueFrom(this.deviceApi.list()));
        } catch (error) {
            const candidate = error as {error?: {error?: string}; message?: string};
            this.devicesError.set(
                candidate.error?.error ?? candidate.message ?? 'Impossibile caricare i dispositivi'
            );
        } finally {
            this.devicesLoading.set(false);
        }
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
}
