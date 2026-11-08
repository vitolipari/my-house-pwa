import {Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DeviceSmallType, DeviceType, GroupType, VOID_DEVICE, ZoneType} from '../devices/devices.models';
import {DecimalPipe, JsonPipe, KeyValuePipe} from '@angular/common';
import {Drawer} from 'primeng/drawer';
import {PageTitleComponent} from '../../components/page-title.component/page-title.component';
import {DeleteConfirmComponent} from '../../components/delete-confirm-component/delete-confirm-component';
import {PageMenu} from '../../components/page-menu/page-menu';
import {DeviceApiService} from '../devices/device-api';
import {emoj} from '../../utils/string-utils';
import {Slider, SliderSlideEndEvent} from 'primeng/slider';
import {FormsModule} from '@angular/forms';
import {EventTimerType, FullTimerType} from '../timer/timer.models';
import {Checkbox} from 'primeng/checkbox';
import {SwitcherComponent} from '../../components/switcher/switcher.component';
import {italianHolidays} from '../../utils/time-utils';
import moment from 'moment/moment';
import {firstValueFrom} from 'rxjs';
import {ScenarioApiService} from '../scenario/scenario-api';
import {ScenarioType} from '../scenario/scenario.models';
import {flattenToKeyValue, getLastElementOr} from '../../utils/array-util';
import {Accordion, AccordionContent, AccordionHeader, AccordionPanel} from 'primeng/accordion';

@Component({
    selector: 'app-device-details.page',
    imports: [
        Drawer,
        PageTitleComponent,
        DeleteConfirmComponent,
        PageMenu,
        Slider,
        FormsModule,
        Checkbox,
        DecimalPipe,
        SwitcherComponent,
        KeyValuePipe,
        Accordion,
        AccordionContent,
        AccordionHeader,
        AccordionPanel,
        // Checkbox,
        // SwitcherComponent
    ],
    templateUrl: './device-details.page.html',
    styleUrl: './device-details.page.css',
    standalone: true
})
export class DeviceDetailsPage implements OnInit {


    timers: (FullTimerType & { sectors: number[][]; arcs: string[]; })[] = [];
    circle = {
        x: 50,
        y: 50,
        // 45 e non 50: con stroke-width 10 metà del tratto uscirebbe dal viewBox 0 0 100 100
        r: 40,
        width: 15
    };
    protected scenarios: (ScenarioType & { running: boolean; })[] = [];
    protected groups: GroupType[] = [];
    protected room: ZoneType = null as unknown as ZoneType;
    private webSocketChannel!: WebSocket;

    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly deviceApi = inject(DeviceApiService);
    readonly scenarioApi: ScenarioApiService = inject(ScenarioApiService);

    readonly data = this.router.currentNavigation()?.extras.state as { from: string; device?: DeviceType; } | undefined;
    readonly deviceId = this.route.snapshot.paramMap.get('id');
    protected openConfirmDeletion: boolean = false;
    protected readonly isInDeleteDeviceInWaiting = signal<boolean>(false);
    protected readonly timersWaiting = signal<boolean>(true);
    protected readonly scenariosWaiting = signal<boolean>(true);
    protected readonly groupWaiting = signal<boolean>(true);
    protected readonly roomWaiting = signal<boolean>(true);
    protected readonly deviceWaiting = signal<boolean>(true);
    protected readonly isDeviceActionInWaiting = signal<boolean>(false);
    protected device = signal(VOID_DEVICE);


    constructor() {
        // controllo se device é stato passato oppure si proviene da url
        if( !this.device() ) {
            // TODO chiamata a /api/core/device/:id
            // id vale deviceID
        }

    }

    ngOnInit() {


        if(!!this.device().id) {
            // device presente
            this.setUpSetValueStatus();
            this.openWebSocketComunication();
            console.log(this.device());
            this.deviceWaiting.set(false);
        }
        else {
            if ( !!this.router.currentNavigation()?.extras.state?.['device'] ) {
                // device passato da navigazione
                this.device.set( this.router.currentNavigation()?.extras.state?.['device'] as DeviceType );
                this.openWebSocketComunication();
                this.setUpSetValueStatus();
                console.log(this.device());
                this.deviceWaiting.set(false);
            }
            else {
                // device non passato da navigazione

                if( !!this.route.snapshot.params['id'] ) {

                    firstValueFrom(this.deviceApi.search({ids: [parseInt(''+ this.deviceId)] }))
                        .then((device: DeviceType[]) => {
                            this.device.set( device.reduce(getLastElementOr, null as unknown as DeviceType) );
                            this.openWebSocketComunication();
                            this.setUpSetValueStatus();
                            console.log(this.device());
                            this.deviceWaiting.set(false);
                        })

                }
                else {
                    // anomalia
                }

            }
        }

        firstValueFrom(this.deviceApi.getAllGroupByDeviceId(parseInt(''+ this.deviceId)))
            .then((groups: GroupType[]) => {
                this.groups = groups;
                this.groupWaiting.set(false);
            })

        firstValueFrom(this.deviceApi.getRoomDeviceId(parseInt(''+ this.deviceId)))
            .then((room: ZoneType) => {
                this.room = room;
                this.roomWaiting.set(false);
            })


        firstValueFrom(this.deviceApi.getAllScenarioByDeviceId(parseInt(''+ this.deviceId)))
            .then((scenarios: ScenarioType[]) => {

                // this.scenarios = scenarios as (ScenarioType & { running: boolean; })[];

                firstValueFrom(this.scenarioApi.getRunningScenarios())
                    .then((runningScenariosIDs: number[]) => {

                        this.scenarios =
                            scenarios
                                .map((sc: ScenarioType) => {
                                    if( runningScenariosIDs.includes( sc.id ) ) {
                                        (sc as (ScenarioType & { running: boolean; })).running = true;
                                    }
                                    return sc as (ScenarioType & { running: boolean; });
                                })
                        ;

                        console.log(this.scenarios);
                        this.scenariosWaiting.set(false);


                    })
                    .catch((error) => {
                        console.log('errore in getRunningScenarios');
                        console.error(error);
                        return null;
                    })
                ;

            })
        ;

        this.deviceApi.getAllTimersByDeviceId(parseInt(''+ this.deviceId))
            .subscribe((timers: FullTimerType[]) => {





                const list = timers as (FullTimerType & { sectors: number[][]; arcs: string[]; })[];
                this.timers =
                list
                    .map((fullDataTimer: (FullTimerType & { sectors: number[][]; arcs: string[]; })) => {

                        // il Core non manda arcs: senza inizializzarlo la push fallisce
                        fullDataTimer.arcs = [];

                        fullDataTimer.sectors =
                            fullDataTimer.slots
                                .map((slot: EventTimerType) => {

                                    let isHolidayToday: boolean = italianHolidays(moment().year()).includes(moment().format('YYYY-MM-DD'));
                                    if(
                                        moment(slot.trigger_time, 'HHmm') <= moment()
                                        && moment(slot.slot_until, 'HHmm') >= moment()
                                        && !!fullDataTimer.weekDays[moment().isoWeekday() -1]
                                        && ( !!isHolidayToday ? !!fullDataTimer.isHolidays : true )
                                        && !!fullDataTimer.enabled
                                    ) {
                                        fullDataTimer.isRunning = true
                                    }

                                    // console.log('controllo fullDataTimer '+ fullDataTimer.id +' '+ fullDataTimer.name );
                                    // console.log('dopo il trigger '+ slot.trigger_time +' '+ moment().format('HHmm') +' '+ (moment(slot.trigger_time, 'HHmm') <= moment()));
                                    // console.log( 'entro la fine '+ (moment(slot.slot_until, 'HHmm') >= moment()));
                                    // console.log( 'questo giorno '+ !!fullDataTimer.weekDays[moment().isoWeekday() -1]);
                                    // console.log( 'in festa se festa '+ ( !!isHolidayToday ? !!fullDataTimer.isHolidays : true ));
                                    // console.log( 'acceso '+!!fullDataTimer.enabled);



                                    return slot;
                                })
                                .map((slot: EventTimerType) => {

                                    let startH = parseInt((''+ slot.trigger_time).split('')[0] + (''+ slot.trigger_time).split('')[1]);
                                    let startM  = parseInt((''+ slot.trigger_time).split('')[2] + (''+ slot.trigger_time).split('')[3]);
                                    let startMinuteIndex = (startH * 60) + startM;

                                    let stopH = parseInt((''+ slot.slot_until).split('')[0] + (''+ slot.slot_until).split('')[1]);
                                    let stopM  = parseInt((''+ slot.slot_until).split('')[2] + (''+ slot.slot_until).split('')[3]);
                                    let stopMinuteIndex = (stopH * 60) + stopM;

                                    // gli indici sono in minuti: un giro sono 24 * 60 minuti
                                    let startAngle = 2 * startMinuteIndex * Math.PI / (60 * 24);
                                    let stopAngle = 2 * stopMinuteIndex * Math.PI / (60 * 24);

                                    return [startAngle, stopAngle];

                                })
                                .map(([startAngle, stopAngle]) => {

                                    if( !isNaN(startAngle) && !isNaN(stopAngle) ) {

                                        // coordinate svg
                                        // console.log([startAngle, stopAngle]);
                                        const ampiezza = stopAngle - startAngle;

                                        // Questa funzione gestisce archi maggiori di 0 e minori di un giro.
                                        if (!(ampiezza > 0 && ampiezza < 2 * Math.PI)) {
                                            console.log("L'ampiezza deve essere compresa tra 0 e 2π, esclusi");
                                        }

                                        const x1 = this.circle.x + this.circle.r * Math.cos(startAngle);
                                        const y1 = this.circle.y + this.circle.r * Math.sin(startAngle);

                                        const x2 = this.circle.x + this.circle.r * Math.cos(stopAngle);
                                        const y2 = this.circle.y + this.circle.r * Math.sin(stopAngle);

                                        const arcoGrande = ampiezza > Math.PI ? 1 : 0;

                                        fullDataTimer.arcs.push( `
                                                    M ${x1} ${y1}
                                                    A ${this.circle.r} ${this.circle.r} 0 ${arcoGrande} 1 ${x2} ${y2}
                                                `);
                                    }


                                    return [startAngle, stopAngle];
                                })
                        ;

                        // timer.weekDays

                        return fullDataTimer;


                    })
                ;

                console.log( timers );
                this.timersWaiting.set(false);


            });


    }


    setUpSetValueStatus() {
        // brightness
        this.sliderValue = parseInt( ''+ this.device().status[ this.device().channel.indexOf('brightness') ]);
    }


    itemEmojIcon(emojIconName: string) {
        return emoj(emojIconName || '');
    }



    protected confirmDeleteDevice() {
        return null;
    }


    protected editData() {

    }

    protected duplicate() {

    }

    protected delete() {
        this.openConfirmDeletion = true;
    }
    // per <delete-confirm-component>: arrow function, così il componente le chiama senza perdere il this
    protected readonly deleteDeviceByIDs = (ids: number[]) => this.deviceApi.deleteDevices([this.device().id]);
    protected readonly exit = () => this.router.navigate(['/devices-page']);
    protected sliderValue: number = 0;


    protected onSlideValue() {

    }

    protected onSlideValueEnd(event: SliderSlideEndEvent) {
        console.log(event.value);

        this.isDeviceActionInWaiting.set(true);
        Promise.all([
            firstValueFrom(this.deviceApi.deviceAction(this.device().id, 'output', 'POWER:ON')),
            firstValueFrom(this.deviceApi.deviceAction(this.device().id, 'brightness', `SET:${event.value}`))
        ])
            .then((result: unknown) => {
                console.log(result);
                this.isDeviceActionInWaiting.set(false);
            })
            .catch((error: unknown) => {
                console.log(`errore in onSlideValueEnd: azione sul dispositivo ${this.device().id}`);
                console.log(error);
                this.isDeviceActionInWaiting.set(false);
                return null;
            });

    }

    protected isRunning(device: DeviceType) {
        let runningStatus: boolean = false;
        try {
            runningStatus = !!device.status[ device.channel.indexOf('output') ];
        }
        catch (e) {

        }
        return runningStatus;
    }

    protected wifiSignalInOpacityRange(device: DeviceSmallType) {


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

    protected readonly flattenToKeyValue = flattenToKeyValue;

    protected switchAction(device: DeviceSmallType, event: boolean) {

        this.isDeviceActionInWaiting.set(true);
        firstValueFrom(this.deviceApi.deviceAction(this.device().id, 'output', event ? 'POWER:ON' : 'POWER:OFF'))
            .then((result: unknown) => {


                try {
                    device.status[ device.channel.indexOf('output') ] = !!event;
                }
                catch (e) {

                }

                this.isDeviceActionInWaiting.set(false);
                return result;
            })
            .catch((error: unknown) => {
                console.log(`errore in switchAction: azione sul dispositivo ${this.device().id}`);
                console.log(error);
                this.isDeviceActionInWaiting.set(false);
                return null;
            });
    }


    private openWebSocketComunication() {

        let protocol = (location.protocol === 'https:') ? 'wss://' : 'ws://';
        let channel = new WebSocket(protocol + location.host + '/api/core/');
        this.webSocketChannel = channel;

        channel.onopen = (ch: any) => {
            console.log('canale websocket aperto');
            console.log(ch);
        }

        // dal Core arriva il DeviceType di un dispositivo che ha cambiato lo stato o il valore di un canale: prende il
        // posto di quello con lo stesso id, e le liste derivate da `devices` (stanze) si ricalcolano da sole
        channel.onmessage = (msg: any) => {

            try {
                let device: DeviceType = JSON.parse(msg.data);
                if(parseInt(''+ device.id) === parseInt(''+ this.device().id)) {
                    console.log('dati ricevuti');
                    console.log('status di luminosita al acanale '+ device.channel.indexOf('brightness') );
                    console.log( device.status[ device.channel.indexOf('brightness') ] );
                    console.log( JSON.parse(msg.data) );
                    this.device.set( device );
                }
            }
            catch (e: any) {
                console.log('errore in onmessage di DevicesPage: messaggio della WebSocket non valido');
                console.log(e);
            }
        }

    }
}
