import {Component, EventEmitter, inject, Input, OnInit, Output, signal} from '@angular/core';
import {ApiUrlService} from '../../../services/api-url-service';
import {DeviceApiService} from '../../../pages/devices/device-api';
import {Router} from '@angular/router';
import {DeviceSmallType, DeviceType, isSensorDevice} from '../../../pages/devices/devices.models';
import {emoj} from '../../../utils/string-utils';
import {getLastElementOr} from '../../../utils/array-util';
import moment from 'moment';
import {SwitcherComponent} from '../../switcher/switcher.component';
import {firstValueFrom} from 'rxjs';
import {timestampInMilliseconds} from '../../../utils/time-utils';
import {environment} from '../../../../environments';
import {Checkbox, CheckboxChangeEvent} from 'primeng/checkbox';

@Component({
  selector: 'device-block-component',
    imports: [
        SwitcherComponent,
        Checkbox
    ],
  templateUrl: './device-block.component.html',
  styleUrls: [
      './device-block.component.css'
      // , '../../../devices/devices.page.css'
  ],
})
export class DeviceBlockComponent implements OnInit {


    private readonly api = inject<ApiUrlService>(ApiUrlService);
    private readonly deviceApi = inject(DeviceApiService);
    private router = inject(Router);

    @Input() device!: DeviceType;
    @Input() noDetails: boolean = false;
    @Input() noNavigateToDetails: boolean = false;
    @Input() noDeviceStatus: boolean = false;
    @Input() isCheckable: boolean = false;

    @Output() deviceToggle = new EventEmitter<boolean>();

    readonly isDeviceStatusInWaiting = signal<boolean>(false);
    readonly isSwitchInError = signal<boolean>(false);


    ngOnInit(): void {
        this.loadDevicesStatus();
    }

    gotoDeviceDetailsPage(id: number | string) {

        if( !this.noNavigateToDetails ) {

            // TODO controllo permesso
            this.router.navigate(
                [`/device-details/${id}`],
                {
                    state: {
                        from: 'mobileMenu',
                        device: this.device
                    }
                }
            );

        }


    }

    itemEmojIcon(emojIconName: string) {
        if (!emojIconName) {
            // TODO
        }
        return emoj(emojIconName || '');
    }

    // testo «valore unità» di un canale del sensore: la riga della lista è un DeviceSmallType, senza value e unit
    sensorChannelText(device: DeviceSmallType, channelKey: string): string {
        const d = this.device;
        if (!d || !isSensorDevice(d)) return '';
        const index = d.channel.indexOf(channelKey);
        if (index === -1 || d.value[index] === null || d.value[index] === undefined) return '';
        return `${d.value[index]} ${d.unit?.[index] ?? ''}`.trim();
    }

    getMainChannelLastTimeUpdated(device: DeviceSmallType): string {
        let d: DeviceType = this.device;
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
        let d: DeviceType = this.device;
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


    // accende o spegne il canale output dell'attuatore. Lo stato si aggiorna subito, così
    // l'interruttore resta allineato; se il Core risponde con un errore torna al valore precedente
    switchAction(device: DeviceSmallType, event: boolean) {
        const channelIndex: number = this.device.channel.indexOf('output');
        if (channelIndex === -1) {
            console.log(`switchAction: il dispositivo ${this.device.id} non ha il canale output`);
            return;
        }
        const previousStatus: DeviceType['status'][number] = this.device.status[channelIndex] ?? null;

        this.device = this.withChannelStatus(this.device, channelIndex, event);
        this.isSwitchInError.set(false);
        this.isDeviceStatusInWaiting.set(true);

        firstValueFrom(this.deviceApi.deviceAction(this.device.id, 'output', event ? 'POWER:ON' : 'POWER:OFF'))
            .then((result: unknown) => {
                this.isDeviceStatusInWaiting.set(false);
                return result;
            })
            .catch((error: unknown) => {
                console.log(`errore in switchAction: azione sul dispositivo ${this.device.id}`);
                console.log(error);
                this.device = this.withChannelStatus(this.device, channelIndex, previousStatus);
                this.isSwitchInError.set(true);
                this.isDeviceStatusInWaiting.set(false);
                return null;
            });
    }

    // copia del dispositivo con lo stato del canale indicato sostituito
    private withChannelStatus(device: DeviceType, channelIndex: number, value: DeviceType['status'][number]): DeviceType {
        return {
            ...device,
            status: device.status.map((current, index) => index === channelIndex ? value : current)
        } as DeviceType;
    }


    isDeviceInWaiting(device: DeviceSmallType) {
        return this.isDeviceStatusInWaiting()

    }


    // isCurrentDeviceStatusInWaiting(device: DeviceSmallType) {
    //
    //     let deviceStatusWaiting = this.isDeviceStatusInWaiting().find((d) => d.id === device.id);
    //     if (!deviceStatusWaiting) {
    //         return false;
    //     } else {
    //         return deviceStatusWaiting.inWaiting;
    //     }
    // }



    deviceChannelStatus(
        device: DeviceSmallType,
        channelKey: string
    ): DeviceType['status'][number] {
        const channelIndex = device.channel.indexOf(channelKey);
        return channelIndex === -1
            ? null
            : device.status[channelIndex] ?? null;
    }

    getMainChannel(device: DeviceSmallType): string {
        let d: DeviceType = this.device
        ;
        let mainChannelText: string = '';
        if(!d) return mainChannelText;


        if (isSensorDevice(d)) {
            const powerChannelIndex: number = d.channel.lastIndexOf('power');
            const power = (powerChannelIndex !== -1) ? d.value[powerChannelIndex] : null;
            if (power !== null && power !== undefined) {
                return `${power} ${d.unit?.[powerChannelIndex] ?? ''}`.trim();
            }
            const batteryChannelIndex: number = d.channel.lastIndexOf('battery');
            const battery = (batteryChannelIndex !== -1) ? d.value[batteryChannelIndex] : null;
            if (battery !== null && battery !== undefined) {
                // EnergySocket
                const batteryIcon = `<svg
                    <use
                        [attr.href]="'#icon-272'"
                        [attr.xlink:href]="'#icon-272'"
                    >
                    </use>
                </svg>`;
                return ` ${battery} ${d.unit?.[batteryChannelIndex] ?? ''}`.trim();
            }
        }

        return mainChannelText;
    }


    loadDevicesStatus() {

        if( this.needsStatusRefresh(this.device, Date.now()) ) {

            this.isDeviceStatusInWaiting.set(true);

            firstValueFrom(this.deviceApi.loadDeviceStatus(this.device.id))

                .then((refreshed: DeviceType) => {

                    console.log(`status del device ${ this.device.id }`);
                    console.log(refreshed);
                    console.log(this.device);


                    this.device = refreshed;
                    this.isDeviceStatusInWaiting.set(false);
                    return refreshed;

                })

                .catch((error: unknown) => {
                    console.error(
                        `Aggiornamento status del dispositivo ${this.device.id} non riuscito`,
                        error
                    );
                    this.isDeviceStatusInWaiting.set(false);
                    return null as unknown as DeviceType;
                })


        }

    }

    // lo stato si rilegge dal Core solo se nessun canale ha un lastTime valido o se il più recente
    // è più vecchio della soglia: la lista arriva già dalla cache del Core, tenuta aggiornata dai messaggi
    private needsStatusRefresh(device: DeviceType, now: number): boolean {
        if (device.channel.length === 0) {
            return false;
        }

        const lastReadTimes: number[] = (device.lastTime ?? [])
            .map((value) => timestampInMilliseconds(value))
            .filter((value): value is number => value !== null);

        if (lastReadTimes.length === 0) {
            return true;
        }

        return now - Math.max(...lastReadTimes) > environment.REFRESH_STATUS_THRESHOLD;
    }


    protected toggleSelctedDevice(event: CheckboxChangeEvent) {
        this.deviceToggle.emit( true );
    }
}
