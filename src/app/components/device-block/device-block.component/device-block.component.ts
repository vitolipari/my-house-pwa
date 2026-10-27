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
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'device-block-component',
    imports: [
        SwitcherComponent,
        Checkbox,
        FormsModule
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
    @Input() checked: boolean | undefined | null;

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
    sensorChannelText(
        device: DeviceSmallType,
        channelKey: string,
        options?: {
            showUnit?: boolean;
            showValue?: boolean;
            forceKW?: boolean;
        }
    ): string {
        const d = this.device;
        if (!d || !isSensorDevice(d)) return '';
        const index = d.channel.indexOf(channelKey);
        if (index === -1 || d.value?.[index] === null || d.value?.[index] === undefined) return '';

        let value: number | string | boolean | null = d.value[index];

        // controllo options: kW solo per la visualizzazione, d.value resta in W
        // (scriverlo in d.value lo divideva di nuovo per 1000 a ogni change detection, fino a 0)
        if( (d.unit?.[index] ?? '').trim().toLowerCase() === 'w' ) {
            if( !!options?.forceKW ) {
                value = Math.trunc(parseInt(''+ value) / 10) / 100;
            }
        }

        return `${ value } ${ !!options?.forceKW ? 'K': '' }${d.unit?.[index] ?? ''}`.trim();

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
            const power = (powerChannelIndex !== -1) ? (d.value?.[powerChannelIndex] || 0) : 0;
            const minThreshold = d.minThreshold?.[powerChannelIndex];
            const maxThreshold = d.maxThreshold?.[powerChannelIndex];
            if( !! minThreshold ) {
                if( power < minThreshold ) return -1;
            }
            if( !! maxThreshold ) {
                if( power > maxThreshold ) return 1;
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

        console.log('main channel per '+ device.name);

        let d: DeviceType = this.device
        ;
        let mainChannelText: string = '';
        if(!d) return mainChannelText;


        if (isSensorDevice(d)) {

            console.log('in dispositivo é un sensore');

            const powerChannelIndex: number = d.channel.lastIndexOf('power');
            const power = (powerChannelIndex !== -1) ? d.value?.[powerChannelIndex] : null;
            if (power !== null && power !== undefined) {
                return `${power} ${d.unit?.[powerChannelIndex] ?? ''}`.trim();
            }

            // in caso di batteria
            const batteryChannelIndex: number = d.channel.lastIndexOf('battery');
            const battery = (batteryChannelIndex !== -1) ? d.value?.[batteryChannelIndex] : null;
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

            // EM a 2 pinze
            const powerChannelIndexes: number[] = [d.channel.lastIndexOf('power_0'), d.channel.lastIndexOf('power_1')];
            if(powerChannelIndexes[0] !== -1) {
                const powers =
                    [
                        (powerChannelIndexes[0] !== -1) ? d.value?.[powerChannelIndexes[0]] : 0,
                        (powerChannelIndexes[1] !== -1) ? d.value?.[powerChannelIndexes[1]] : 0
                    ] as number[];
                ;
                powers[0] = Math.floor(powers[0] / 10) / 100;
                powers[1] = Math.floor(powers[1] / 10) / 100;
                return `${ powers[0] }K${ d.unit?.[powerChannelIndexes[0]] ?? '' } | ${ powers[1] }K${ d.unit?.[powerChannelIndexes[1]] ?? '' }`;
            }

            // clima ------------------------------------------------------------------------------------------------------
            if(
                !!d.hardware
                && !!d.hardware.config
                && !!d.hardware.config.up_down_sweep
            ) {

                let allModes = d.hardware.config.mode.range;                        // ["cold","hot","wet","wind","auto"],
                let allWindSpeed = d.hardware.config.windspeed.range;               // ["strong","high","mid_high","mid","mid_low","low","mute","auto"],
                let allUpDwonSpeed = d.hardware.config.up_down_sweep.range;         //  ["0","1","2","3"],
                let allLeftRightSpeed = d.hardware.config.left_right_sweep.range;   //  ["0","1","2","3","4","5","6","7"]
                let allAirQuality = d.hardware.config.airquality.range;             //  ["great","good","middle","bad","verybad","veryverybad"],
                let humidity = d.hardware.status.humidity_current.value;

                let allModeIconId = ['icon-424', 'manopola-regolazione', 'goccia-stella-rotante', 'icon-488', 'marker-1']; // l'icona icon-488 si può sostituire con Air
                let allSpeedIcon = ['mute', 'low', 'mid_low', 'mid', 'mid_high', 'high', 'strong', 'auto'];

                const climaChannelIndexes: number[] = [
                    d.channel.lastIndexOf('output'),
                    d.channel.lastIndexOf('mode'),
                    d.channel.lastIndexOf('target_temperature'),
                    d.channel.lastIndexOf('fan'),
                    d.channel.lastIndexOf('air_flow_vertical'),
                    d.channel.lastIndexOf('air_flow_vertical_position'),
                    d.channel.lastIndexOf('air_flow_horizontal'),
                    d.channel.lastIndexOf('air_flow_horizontal_position'),
                    d.channel.lastIndexOf('temperature')
                ];
                if((climaChannelIndexes[4] !== -1) && (climaChannelIndexes[6] !== -1) /*&& (climaChannelIndexes[7] !== -1)*/) {

                    let mode = allModeIconId[d.hardware.config.mode.range.lastIndexOf( d.status[d.channel.lastIndexOf('mode')] )];
                    let targetTemperature = d.status[d.channel.lastIndexOf('target_temperature')];
                    let currentTemperature = d.status[d.channel.lastIndexOf('temperature')];
                    let fanSpeed = d.hardware.config.windspeed.range[ d.hardware.config.windspeed.range.lastIndexOf( d.status[d.channel.lastIndexOf('fan')] ) ];

                    let airFlowVertical = d.hardware.config.up_down_sweep.range[ d.hardware.config.up_down_sweep.range.lastIndexOf( d.status[d.channel.lastIndexOf('air_flow_vertical')] ) ]
                    let airFlowOrizontal = d.hardware.config.left_right_sweep.range[ d.hardware.config.left_right_sweep.range.lastIndexOf( d.status[d.channel.lastIndexOf('air_flow_horizontal')] ) ]

                    let airFlowVerticalPosition = d.status[1 + d.channel.lastIndexOf('air_flow_vertical_position')];
                    let airFlowOrizontalPosition = d.status[1 + d.channel.lastIndexOf('air_flow_horizontal_position')];


                    console.log('main channel per clima');
                    console.log(`${ mode },${ targetTemperature },${ currentTemperature },fan_04-${ fanSpeed },flow_vertical-${ airFlowVertical },flow_orizontal-${ airFlowOrizontal }`);

                    return `${ mode },${ targetTemperature },${ currentTemperature },fan_04-${ fanSpeed },flow_vertical-${ airFlowVertical },flow_orizontal-${ airFlowOrizontal }`;
                }

            }

        }

        return mainChannelText;
    }


    greenOrRedGlow(device: DeviceSmallType) {

        const redGlow: string = 'text-shadow: var(--color-red-outer-glow) 0px 0px 16px; color: var(--color-red-outer-glow);';
        // const redGlow: string = 'text-shadow: var(--medium-red-color) 0px 0px 16px; color: var(--medium-red-color);';

        const greenGlow: string = 'text-shadow: var(--color-outer-glow) 0px 0px 16px; color: var(--color-text-2);';

        let d: DeviceType = this.device;
        let toReturn = '';
        let power: number | null | undefined;
        if(!d) return toReturn;

        if (isSensorDevice(d)) {


            power =

                // channels
                [
                    'power_0',
                    'grid_power'
                ]
                    .map((ch: string) => {
                        const powerChannelIndex: number = d.channel.lastIndexOf(ch);
                        if(powerChannelIndex !== -1) {
                            return ((powerChannelIndex !== -1) ? d.value?.[powerChannelIndex] : 0) as number;
                        }
                        return null;
                    })
                    .filter((x: any) => (x !== null) && (x !== undefined))
                    .reduce(getLastElementOr, null)
            ;

            if((power !== null) && (power !== undefined)) {
                if( power <= 0 ) {
                    toReturn = greenGlow
                }
                else if( power > 0 ) {
                    toReturn = redGlow;
                }
            }

            console.log(`channel di ${ d.name }: ${ power }`);

        }

        return toReturn;
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
        this.deviceToggle.emit( !!event.checked );
    }

    protected openCurtain(device: DeviceType, event: PointerEvent) {
        event.stopImmediatePropagation();
        this.isDeviceStatusInWaiting.set(true);

        const channelIndex: number = this.device.channel.indexOf('open');
        if (channelIndex === -1) {
            console.log(`switchAction: il dispositivo ${this.device.id} non ha il canale open`);
            return;
        }
        const previousStatus: DeviceType['status'][number] = this.device.status[channelIndex] ?? null;


        firstValueFrom(this.deviceApi.deviceAction(this.device.id, 'open', 'POWER:ON'))
            .then((result: unknown) => {
                this.isDeviceStatusInWaiting.set(false);
                return result;
            })
            .catch((error: unknown) => {
                console.log(`errore in open: azione sul dispositivo ${this.device.id}`);
                console.log(error);
                this.device = this.withChannelStatus(this.device, channelIndex, previousStatus);
                this.isSwitchInError.set(true);
                this.isDeviceStatusInWaiting.set(false);
                return null;
            });


    }

    protected closeCurtain(device: DeviceType, event: PointerEvent) {
        event.stopImmediatePropagation();
        this.isDeviceStatusInWaiting.set(true);

        const channelIndex: number = this.device.channel.indexOf('close');
        if (channelIndex === -1) {
            console.log(`switchAction: il dispositivo ${this.device.id} non ha il canale close`);
            return;
        }
        const previousStatus: DeviceType['status'][number] = this.device.status[channelIndex] ?? null;


        firstValueFrom(this.deviceApi.deviceAction(this.device.id, 'close', 'POWER:ON'))
            .then((result: unknown) => {
                this.isDeviceStatusInWaiting.set(false);
                return result;
            })
            .catch((error: unknown) => {
                console.log(`errore in close: azione sul dispositivo ${this.device.id}`);
                console.log(error);
                this.device = this.withChannelStatus(this.device, channelIndex, previousStatus);
                this.isSwitchInError.set(true);
                this.isDeviceStatusInWaiting.set(false);
                return null;
            });

    }
}
