import {Component, DestroyRef, EventEmitter, inject, OnInit, Output, signal} from '@angular/core';
import {InputText, InputTextModule} from 'primeng/inputtext';
import {Button, ButtonModule} from 'primeng/button';
import {Slider, SliderModule} from 'primeng/slider';
import {DatePickerModule} from 'primeng/datepicker';
import {FormsModule} from '@angular/forms';
import {PageTitleComponent} from '../../../components/page-title.component/page-title.component';
import {SwitcherComponent} from '../../../components/switcher/switcher.component';
import {Drawer} from 'primeng/drawer';
import {Checkbox, CheckboxChangeEvent} from 'primeng/checkbox';
import {RadioButton} from 'primeng/radiobutton';
import {ActivatedRoute, Router} from '@angular/router';
import {PermissionService} from '../../../services/permission.service';
import {
    ActionChannelDeviceType,
    EventTriggerChannelDeviceType,
    ScenarioActionValuesType,
    ScenarioDTOType,
    ScenarioType
} from '../scenario.models';
import {getLastElementOr} from '../../../utils/array-util';
import {debounceTime, distinctUntilChanged, firstValueFrom, map, Subject} from 'rxjs';
import {ScenarioApiService} from '../scenario-api';
import {Textarea} from 'primeng/textarea';
import {DeviceType} from '../../devices/devices.models';
import {DeviceApiService} from '../../devices/device-api';
import {emoj} from '../../../utils/string-utils';
import {Select, SelectModule} from 'primeng/select';
import {JsonPipe} from '@angular/common';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {PageMenu} from '../../../components/page-menu/page-menu';
import {DeleteConfirmComponent} from '../../../components/delete-confirm-component/delete-confirm-component';



export const AVOID_CHANNELS = ['energy', 'energy_0', 'energy_1', 'energy_2', 'energy_3', ];
export const CHANNEL_MAPPING = {
    power: 'potenza',
    power_0: 'potenza 0',
    power_1: 'potenza 1',
    output: 'azione ON/OFF',
    tempperature: 'temperatura',
    humidity: 'umidita',
    battery: 'batteria',
    open: 'apertura',
    close: 'chiusura',
    // input: '',
    // input_0: '',
    // input_1: '',
    // input_2: '',
    // input_3: '',
    pv_power: 'potenza prodotta',
    battery_power: 'potenza batteria',
    battery_soc: 'carica batteria',
    load_power: 'potenza consumata',
    grid_power: 'potenza di rete',
    fan: 'aria',
    air_flow_vertical: 'alette verticali',
    air_flow_horizontal: 'alette orizzontali',
    air_flow_vertical_position: 'posizione fissa alette verticali',
    air_flow_horizontal_position: 'posizione fissa alette verticali',
    target_temperature: 'temperatura scelta',
    brightness: 'luminosità',
    mode: 'modalità'
};

// valori di un'azione dal comando del Core (POWER:ON;delay=30;duration=60): booleano per POWER, testo per SET; ritardo
// e durata 0 se mancano. Serve alla modifica e all'abilitazione dalla lista, che mandano il DTO della creazione
export const readScenarioAction = (action: string): ScenarioActionValuesType => {

    let parts: string[] = (''+ (action || '')).split(';');
    let command: string[] = parts[0].split(':');
    let actionValues: ScenarioActionValuesType = {
        value: command[1] ?? '',
        delay: 0,
        duration: 0
    };

    if( command[0] === 'POWER' ) {
        actionValues.value = (command[1] === 'ON');
    }

    parts
        .forEach((part: string) => {

            let keyValue: string[] = part.split('=');

            if( keyValue[0] === 'delay' ) {
                actionValues.delay = parseInt(''+ keyValue[1]) || 0;
            }

            if( keyValue[0] === 'duration' ) {
                actionValues.duration = parseInt(''+ keyValue[1]) || 0;
            }

        })
    ;

    return actionValues;
};

@Component({
  selector: 'app-scenario.page',
    imports: [
        InputText,
        ButtonModule,
        InputTextModule,
        DatePickerModule,
        SliderModule,
        Button,
        FormsModule,
        PageTitleComponent,
        SwitcherComponent,
        Drawer,
        Textarea,
        Checkbox,
        // RadioButton,
        Select,
        SelectModule,
        JsonPipe,
        PageMenu,
        DeleteConfirmComponent
    ],
  templateUrl: './scenario.page.html',
  styleUrl: './scenario.page.css',
})
export class ScenarioPage implements OnInit {

    Mode = {
        DETAILS: 'DETAILS',
        EDIT: 'EDIT',
        NEW: 'NEW'
    }

    scenario: ScenarioType = {
        id: 0,
        name: '',
        description: '',
        enabled: false,
        isImmediate: true,
        triggers: [{
            id: 0,
            device: 0,
            name: '',
            isOwned: false,
            channel: '',
            deviceEmojIcon: '',
            channelSvgIcon: '',
            channelUnit: '',
            channelType: '',
            room: '',
            valueBy: null,
            valueUpTo: null,
            valueAt: null
        }],
        actions: [{
            id: 0,
            device: 0,
            name: '',
            isOwned: false,
            deviceEmojIcon: '',
            channelSvgIcon: '',
            channelUnit: '',
            channelType: '',
            room: '',
            channel: '',
            value: 0
        }]
    };


    openConfirmDeletion: boolean = false;
    currentMode: string = this.Mode.DETAILS;
    isAtEvents: boolean = false;
    // triggerDevices: EventTriggerChannelDeviceType[] = [];
    // actionDevices: ActionChannelDeviceType[] = [];
    devices: DeviceType[] = [];
    searchTrigger!: string;
    searchAction!: string;
    protected readonly searchTriggerText$ = new Subject<string>();
    protected readonly searchActionText$ = new Subject<string>();

    protected readonly visibleTriggers = signal<EventTriggerChannelDeviceType[]>([]);
    protected readonly visibleActions = signal<ActionChannelDeviceType[]>([]);


    CHANNEL_MAPPING = CHANNEL_MAPPING;
    eventOuput: string[] = ['acceso', 'spento'];

    readonly inWaiting = signal<boolean>(false);
    // readonly isInDeleteScenarioInWaiting = signal<boolean>(false);    // ora l'attesa è in <delete-confirm-component>
    readonly isConfirmable = signal<boolean>(true);
    protected readonly isDeviceLoading = signal<boolean>(true);



    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly permissionService = inject(PermissionService);
    readonly scenarioApi: ScenarioApiService = inject(ScenarioApiService);
    private readonly deviceApi = inject(DeviceApiService);
    private readonly destroyRef = inject(DestroyRef);


    readonly routeInfo = this.route.snapshot.data; // oggetto data della rotta = accessControl.permission
    readonly pathVariables = this.route.snapshot.params; // oggetto con i pathVariables
    readonly routeParamater = this.route.snapshot.queryParams; // oggetto con la query string
    readonly navigationData = this.router.currentNavigation()?.extras.state;    // passato dalla navigazione


    @Output() menuToggle = new EventEmitter<boolean>();
    @Output() menuClose = new EventEmitter<boolean>();


    constructor() {
        console.log('costruttore');
        console.log(this.routeInfo);
        console.log(this.pathVariables);
        console.log(this.routeParamater);
        console.log(this.navigationData);


        if( !!this.routeInfo && !!this.routeInfo['accessControl'] && !!this.routeInfo['accessControl'].isReadOnly ) {
            // siamo nella pagina di sola lettura
            this.currentMode = this.Mode.DETAILS;
            console.log('siamo in dettaglio');



            if (!this.navigationData || !this.navigationData['details']) {
                // bisogna caricare i dati della stanza
                // perché non sono arrivati dalla navigazione interna

                console.log('dati del scenario assenti, parte la chiamata');

                this.inWaiting.set(true);

                firstValueFrom(this.scenarioApi.searchScenarios({id: this.pathVariables['id']}))
                    .then((scenarios: ScenarioType[]) => {

                        this.scenario = scenarios.reduce(getLastElementOr, null);


                        this.scenario.triggers =
                            this.scenario.triggers
                                .map((triggerDevice: EventTriggerChannelDeviceType) => {

                                    // channel: chiave del Core → etichetta della pagina, come in setDevices
                                    let channelName: string = (triggerDevice.channel as unknown as {id: number; name: string;}).name;
                                    triggerDevice.channel = CHANNEL_MAPPING[channelName as keyof typeof CHANNEL_MAPPING] ?? channelName;

                                    // valueBy
                                    triggerDevice.valueBy =
                                        !!(triggerDevice as any).eventValueFrom
                                            ? (triggerDevice as any).eventValueFrom
                                            : triggerDevice.valueBy
                                    ;

                                    // valueUpTo
                                    triggerDevice.valueUpTo =
                                        !!(triggerDevice as any).eventValueUpTo
                                            ? (triggerDevice as any).eventValueUpTo
                                            : triggerDevice.valueUpTo
                                    ;

                                    // valueAt
                                    triggerDevice.valueAt =
                                        !!(triggerDevice as any).eventValueAt
                                            ? (triggerDevice as any).eventValueAt
                                            : triggerDevice.valueAt
                                    ;

                                    // unit: '' per i canali senza misura, come in setDevices
                                    triggerDevice.channelUnit =
                                        !!(triggerDevice as any).unit
                                            ? (triggerDevice as any).unit
                                            : ''
                                    ;

                                    return triggerDevice;
                                })
                        ;

                        this.scenario.actions =
                            this.scenario.actions
                                .map((actionDevice: ActionChannelDeviceType)=> {

                                    // channel: chiave del Core → etichetta della pagina, come in setDevices
                                    let channelName: string = (actionDevice.channel as unknown as {id: number; name: string;}).name;
                                    actionDevice.channel = CHANNEL_MAPPING[channelName as keyof typeof CHANNEL_MAPPING] ?? channelName;


                                    // unit: '' per i canali senza misura, come in setDevices
                                    actionDevice.channelUnit =
                                        !!(actionDevice as any).unit
                                            ? (actionDevice as any).unit
                                            : ''
                                    ;


                                    return actionDevice;
                                })
                        ;

                        this.isAtEvents = !this.scenario.isImmediate;



                        this.inWaiting.update(() => false);
                        console.log('dati del scenario assenti, chiamata terminata');
                        console.log(this.scenario);

                    })
                    .catch((e: any) => {
                        console.log('errore nelle ricerca dello scenario '+ this.pathVariables['id']);
                        console.log(e);
                        this.inWaiting.update(() => false);
                    })
            }
            else {
                // dati passati attravberso la navigazione



                this.scenario = this.navigationData['details'];
                this.scenario.triggers =
                    this.scenario.triggers
                        .map((triggerDevice: EventTriggerChannelDeviceType) => {

                            // channel: chiave del Core → etichetta della pagina, come in setDevices
                            let channelName: string = (triggerDevice.channel as unknown as {id: number; name: string;}).name;
                            triggerDevice.channel = CHANNEL_MAPPING[channelName as keyof typeof CHANNEL_MAPPING] ?? channelName;

                            // valueBy
                            triggerDevice.valueBy =
                                !!(triggerDevice as any).eventValueFrom
                                    ? (triggerDevice as any).eventValueFrom
                                    : triggerDevice.valueBy
                            ;

                            // valueUpTo
                            triggerDevice.valueUpTo =
                                !!(triggerDevice as any).eventValueUpTo
                                    ? (triggerDevice as any).eventValueUpTo
                                    : triggerDevice.valueUpTo
                            ;

                            // valueAt
                            triggerDevice.valueAt =
                                !!(triggerDevice as any).eventValueAt
                                    ? (triggerDevice as any).eventValueAt
                                    : triggerDevice.valueAt
                            ;

                            // unit: '' per i canali senza misura, come in setDevices
                            triggerDevice.channelUnit =
                                !!(triggerDevice as any).unit
                                    ? (triggerDevice as any).unit
                                    : ''
                            ;

                            return triggerDevice;
                        })
                ;

                this.scenario.actions =
                    this.scenario.actions
                        .map((actionDevice: ActionChannelDeviceType)=> {

                            // channel: chiave del Core → etichetta della pagina, come in setDevices
                            let channelName: string = (actionDevice.channel as unknown as {id: number; name: string;}).name;
                            actionDevice.channel = CHANNEL_MAPPING[channelName as keyof typeof CHANNEL_MAPPING] ?? channelName;


                            // unit: '' per i canali senza misura, come in setDevices
                            actionDevice.channelUnit =
                                !!(actionDevice as any).unit
                                    ? (actionDevice as any).unit
                                    : ''
                            ;

                            return actionDevice;
                        })
                ;

                this.isAtEvents = !this.scenario.isImmediate;


                console.log('dati passati da navigazione');
                console.log(this.scenario);


            }



        }
        else {

            // siamo in nuovo scenario
            this.currentMode = this.Mode.NEW;
            console.log('siamo in nuovo scenario');


        }



        this.searchTriggerText$
            .pipe(
                map((text: string) => (text ?? '').trim().toLowerCase()),
                debounceTime(300),
                distinctUntilChanged(),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                next: (searchText: string) => {


                    this.visibleTriggers.set(
                        // this.visibleTriggers()
                        this.scenario.triggers
                            .filter((deviceTrigger: EventTriggerChannelDeviceType) => {

                                if( searchText === '' ) {
                                    return true;
                                }

                                if( !!deviceTrigger.isOwned ) {
                                    return true;
                                }

                                let keyText: string =
                                    [
                                        deviceTrigger.room,
                                        deviceTrigger.name,
                                        deviceTrigger.channel
                                    ]
                                        .join(' ')
                                        .toLowerCase()
                                ;

                                return keyText.indexOf(searchText) !== -1;

                            })
                    );

                    // this.triggerFilter.set(text);
                    // this.filterTriggers();
                },
                error: (e: any) => {
                    console.log('errore nella ricerca in pagina degli eventi dello scenario');
                    console.log(e);
                }
            })
        ;

        this.searchActionText$
            .pipe(
                map((text: string) => (text ?? '').trim().toLowerCase()),
                debounceTime(300),
                distinctUntilChanged(),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                next: (searchText: string) => {


                    this.visibleActions.set(
                        // this.visibleActions()
                        this.scenario.actions
                            .filter((deviceAction: ActionChannelDeviceType ) => {

                                if( searchText === '' ) {
                                    return true;
                                }

                                if( !!deviceAction.isOwned ) {
                                    return true;
                                }

                                let keyText: string =
                                    [
                                        deviceAction.room,
                                        deviceAction.name,
                                        deviceAction.channel
                                    ]
                                        .join(' ')
                                        .toLowerCase()
                                ;

                                return keyText.indexOf(searchText) !== -1;

                            })
                    );

                    // this.triggerFilter.set(text);
                    // this.filterTriggers();
                },
                error: (e: any) => {
                    console.log('errore nella ricerca in pagina degli eventi dello scenario');
                    console.log(e);
                }
            })
        ;


    }



    ngOnInit(): void {
        if( this.currentMode === this.Mode.NEW ) {
            this.loadDevices();
        }
    }




    protected editData() {
        this.currentMode = this.Mode.EDIT;

        // eventi e azioni salvati appartengono allo scenario: in modifica partono selezionati. Il Core manda il
        // DeviceType intero: la pagina tiene l'id e ne copia nome, stanza ed emoji, come setDevices
        this.scenario.triggers
            .forEach((trigger: EventTriggerChannelDeviceType) => {

                let deviceObj: DeviceType = trigger.device as unknown as DeviceType;

                trigger.isOwned = true;
                trigger.device = parseInt(''+ deviceObj.id);
                trigger.name = deviceObj.name;
                trigger.room = deviceObj.where.reduce(getLastElementOr, {id: 0, name: 'Nessuna Stanza'}).name;
                trigger.deviceEmojIcon = deviceObj.emoj;
            })
        ;

        // le azioni prendono anche il tipo del canale (valueType del Core) e, dal comando, valore, ritardo e durata
        this.scenario.actions
            .forEach((action: ActionChannelDeviceType) => {

                let deviceObj: DeviceType = action.device as unknown as DeviceType;
                let actionValues: ScenarioActionValuesType = readScenarioAction((action as any).action);

                action.isOwned = true;
                action.device = parseInt(''+ deviceObj.id);
                action.name = deviceObj.name;
                action.room = deviceObj.where.reduce(getLastElementOr, {id: 0, name: 'Nessuna Stanza'}).name;
                action.deviceEmojIcon = deviceObj.emoj;
                action.channelType = (''+ (action as any).valueType).toLowerCase();
                action.value = actionValues.value;
                action.delay = actionValues.delay;
                action.duration = actionValues.duration;
            })
        ;

        this.visibleTriggers.set( this.scenario.triggers );
        this.visibleActions.set( this.scenario.actions );

        // tutti i dispositivi, per aggiungere eventi e azioni nuovi a quelli dello scenario
        this.loadDevices();

    }

    protected duplicate() {

    }



    // per <delete-confirm-component>: arrow function, così il componente le chiama senza perdere il this
    protected readonly deleteScenarioByIDs = (ids: number[]) => this.scenarioApi.deleteScenarios(ids);
    protected readonly exitToScenarios = () => this.router.navigate(['/scenarios-page']);

    // protected confirmDeleteScenario() {
    //     this.isInDeleteScenarioInWaiting.update(() => true);
    //     firstValueFrom(this.scenarioApi.deleteScenarios([(this.scenario as any).id]))
    //         .then(() => {
    //             this.isInDeleteScenarioInWaiting.update(() => false);
    //             this.router.navigate(['/scenarios-page']);
    //             // window.location.reload();
    //         })
    //         .catch((e) => {
    //             console.log(e);
    //         })
    //     ;
    // }

    protected setName(event: any) {

    }

    protected setDescription(event: any) {

    }

    protected isScenarioEvent(scenario: ScenarioType) {
        return this.isAtEvents;
    }

    protected switchScenarioEvent(scenario: ScenarioType, event: boolean) {
        this.isAtEvents = event;

        // con gli eventi lo scenario non è immediato
        this.scenario.isImmediate = !event;
        if(this.scenario.triggers.length === 0) {
            this.loadDevices();
        }
    }


    private setDevices() {

        this.devices
            .sort((a: DeviceType, b: DeviceType) => {
                if(a.where.reduce(getLastElementOr, {id: 0, name: 'Nessuna Stanza'}).id < b.where.reduce(getLastElementOr, {id: 0, name: 'Nessuna Stanza'}).id) {
                    return -1;
                }
                return 1;
            })
            .forEach((device: DeviceType, dIndex: number) => {


                // event trigger
                device.channel
                    .filter((ch: string) => !AVOID_CHANNELS.includes(ch))
                    .forEach((ch: string) => {

                        // posizione del canale nel DeviceType, per stato e unità (non nella lista filtrata); l'id è solo
                        // della pagina, negativo per non coincidere con gli id di eventi e azioni salvati, in modifica
                        let chIndex: number = device.channel.indexOf(ch);
                        let pageID: number = -((dIndex * 100) + chIndex + 1);
                        let deviceID: number = parseInt(''+ device.id);
                        let channelName: string = CHANNEL_MAPPING[ch as keyof typeof CHANNEL_MAPPING] ?? ch;

                        // in modifica gli eventi e le azioni dello scenario sono già nella lista
                        let isTriggerPresent: boolean =
                            this.scenario.triggers
                                .filter((tr: EventTriggerChannelDeviceType) => tr.device === deviceID)
                                .filter((tr: EventTriggerChannelDeviceType) => tr.channel === channelName)
                                .length > 0
                        ;

                        let isActionPresent: boolean =
                            this.scenario.actions
                                .filter((ac: ActionChannelDeviceType) => ac.device === deviceID)
                                .filter((ac: ActionChannelDeviceType) => ac.channel === channelName)
                                .length > 0
                        ;

                        let isActionChannel: boolean =
                            [
                                'output',
                                'brightness',
                                'mode',
                                'fan',
                                'open',
                                'close',
                                'air_flow_vertical',
                                'air_flow_horizontal',
                                'air_flow_vertical_position',
                                'air_flow_horizontal_position'
                            ].includes(ch)
                        ;


                        if( !isTriggerPresent ) {

                            this.scenario.triggers = [
                                ...this.scenario.triggers,
                                {
                                    id: pageID,
                                    device: deviceID,
                                    name: device.name,
                                    channel: channelName,
                                    isOwned: false,
                                    deviceEmojIcon: device.emoj,
                                    channelSvgIcon: '',
                                    channelUnit: ((''+ device.category.id).trim().toLowerCase().indexOf('sensor') !== -1) ? (device as any).unit[chIndex] : '',
                                    channelType: typeof device.status[chIndex],
                                    room: device.where.reduce(getLastElementOr, {id: 0, name: 'Nessuna Stanza'}).name,
                                    valueBy: null,
                                    valueUpTo: null,
                                    valueAt: null
                                }
                            ]
                                .filter((tr: EventTriggerChannelDeviceType) => !!tr.device)
                                .sort((a: EventTriggerChannelDeviceType, b: EventTriggerChannelDeviceType) => {
                                    if(( a.isOwned !== b.isOwned ) && !!a.isOwned) return -1;
                                    return 1;
                                })
                            ;

                        }



                        if( isActionChannel && !isActionPresent ) {

                            // action
                            this.scenario.actions = [
                                ...this.scenario.actions,
                                {
                                    id: pageID,
                                    device: deviceID,
                                    name: device.name,
                                    channel: channelName,
                                    isOwned: false,
                                    deviceEmojIcon: device.emoj,
                                    channelSvgIcon: '',
                                    channelUnit: ((''+ device.category.id).trim().toLowerCase().indexOf('sensor') !== -1) ? (device as any).unit[chIndex] : '',
                                    channelType: typeof device.status[chIndex],
                                    room: device.where.reduce(getLastElementOr, {id: 0, name: 'Nessuna Stanza'}).name,
                                    value: 0
                                }
                            ]
                                .filter((tr: EventTriggerChannelDeviceType) => !!tr.device)
                                .filter((d: ActionChannelDeviceType) => {
                                    if((d.device === device.id)) {
                                        return (('' + device.category.id).trim().toLowerCase().indexOf('actuator') !== -1)
                                    }
                                    return true;
                                })
                                .sort((a: ActionChannelDeviceType, b: ActionChannelDeviceType) => {

                                    // 1. i propri dispositivi
                                    if(( a.isOwned !== b.isOwned ) && !!a.isOwned) return -1;

                                    // 2. le stanze
                                    if( a.room !== b.room ) return ((a.room < b.room) ? -1 : 1);

                                    // 3. dispositivi
                                    if( a.device !== b.device ) return a.device - b.device;

                                    return 1;
                                })
                            ;

                        }


                    })
                ;

            })
        ;


        this.visibleTriggers.set(this.scenario.triggers);
        this.visibleActions.set(this.scenario.actions);

        console.log(this.scenario.triggers);
        console.log(this.scenario.actions);

    }

    private loadDevices() {
        this.isDeviceLoading.update(() => true);

        firstValueFrom(this.deviceApi.list())
            .then((devices: DeviceType[]) => {


                this.devices = devices;
                console.log('dispositivi arrivati per lo scenario');
                console.log(this.devices);

                // in creazione e in modifica tutti i canali diventano eventi e azioni da scegliere
                if( this.currentMode !== this.Mode.DETAILS ) {
                    this.setDevices();
                }

                this.isDeviceLoading.update(() => false);
            })
            .catch((error: unknown) => {
                console.log('errore in loadDevices della pagina dello scenario');
                console.log(error);
                this.isDeviceLoading.update(() => false);
            });

    }

    protected searchTriggers() {

    }

    protected toggleOwnedDevice(device: EventTriggerChannelDeviceType, event: CheckboxChangeEvent) {

        this.scenario.triggers
            .filter((d: EventTriggerChannelDeviceType) => d.id === device.id)
            .reduce(getLastElementOr, null)
            .isOwned = event.checked
        ;
        this.scenario.triggers
            .sort((a: EventTriggerChannelDeviceType, b: EventTriggerChannelDeviceType) => {
                if(( a.isOwned !== b.isOwned ) && !!a.isOwned) return -1;
                return 1;
            })
        ;

    }




    protected toggleOwnedActionDevice(device: ActionChannelDeviceType, event: CheckboxChangeEvent) {
        this.scenario.actions
            .filter((d: EventTriggerChannelDeviceType) => d.id === device.id)
            .reduce(getLastElementOr, null)
            .isOwned = event.checked
        ;
        this.scenario.actions
            .sort((a: EventTriggerChannelDeviceType, b: EventTriggerChannelDeviceType) => {
                if(( a.isOwned !== b.isOwned ) && !!a.isOwned) return -1;
                return 1;
            })
        ;
    }

    protected saveScenario() {

        let scenarioObj: any = JSON.parse( JSON.stringify(  this.scenario) );
        scenarioObj.triggers =
            scenarioObj.triggers
                .filter((tr: EventTriggerChannelDeviceType) => tr.isOwned)
                .map((tr: EventTriggerChannelDeviceType) => ({
                    device: tr.device,
                    valueAt: tr.valueAt,
                    valueBy: tr.valueBy,
                    valueUpTo: tr.valueUpTo,
                    channel:
                        Object.keys(CHANNEL_MAPPING)
                            .filter( (key: string) => (CHANNEL_MAPPING[key as keyof typeof CHANNEL_MAPPING] === tr.channel) || (key === tr.channel) )
                            .reduce(getLastElementOr, tr.channel)
                }))
        ;

        // scenario immediato: nessun evento, anche se nella lista ne restano di selezionati
        if( !this.isAtEvents ) {
            scenarioObj.triggers = [];
        }

        scenarioObj.actions =
            scenarioObj.actions
                .filter(( da: ActionChannelDeviceType) => da.isOwned)
                .map((da: ActionChannelDeviceType) => ({
                    device: da.device,
                    value: da.value,
                    // ritardo e durata dei comandi salvati, finché la pagina non li fa scegliere
                    delay: da.delay,
                    duration: da.duration,
                    channel:
                        Object.keys(CHANNEL_MAPPING)
                            .filter( (key: string) => (CHANNEL_MAPPING[key as keyof typeof CHANNEL_MAPPING] === da.channel) || (key === da.channel) )
                            .reduce(getLastElementOr, da.channel)
                }))
        ;
        let scenarioDto: ScenarioDTOType = JSON.parse( JSON.stringify( scenarioObj) );

        console.log( scenarioDto );
        debugger;

        this.inWaiting.update(() => true);

        return (
            firstValueFrom(
                // in modifica la PUT, con lo stesso DTO della creazione
                ( this.currentMode === this.Mode.EDIT )
                    ? this.scenarioApi.editScenario(scenarioDto)
                    : this.scenarioApi.createNewScenario(scenarioDto)
            )
                .then((result: any) => {

                    this.inWaiting.update(() => false);
                    this.router.navigate(
                        ['/scenarios-page'],
                        {
                            state: {
                                from: ( this.currentMode === this.Mode.EDIT ) ? 'editScenario' : 'newScenario'
                            }
                        }
                    );

                })
                .catch((error) => {
                    console.log('errore in saveScenario: salvataggio dello scenario');
                    console.error(error);
                    this.inWaiting.update(() => false);
                    return [];
                })
        )

        /*
        tutti gli eventi arrivano a
        applyDeviceQueueMessage()

        tutti i timer vengono lanciati da
        executeAgendaMinute()

        // lancio di un azione
        act(deviceID, channel, act, cause)

        // lista dispositivi
        getDeviceFromCacheOrDb( deviceID )

         */

    }

    protected searchActions() {
        // probabilmente non serve

    }


    itemEmojIcon(trigger: EventTriggerChannelDeviceType | ActionChannelDeviceType) {
        let dispositivo: DeviceType | undefined;
        if( typeof trigger.device === 'number' ) {
            dispositivo = this.devices.find((dispositivo: DeviceType) => dispositivo.id === trigger.device);
        }
        else {
            dispositivo = trigger.device;
        }
        if(!!dispositivo) {
            if (!!dispositivo.emoj) {
                return emoj(dispositivo.emoj || '');
            }
        }
        return '';
    }

    protected getRoom(trigger: EventTriggerChannelDeviceType | ActionChannelDeviceType) {
        let dispositivo: DeviceType | undefined;
        if( typeof trigger.device === 'number' ) {
            dispositivo = this.devices.find((dispositivo: DeviceType) => dispositivo.id === trigger.device);
        }
        else {
            dispositivo = trigger.device;
        }
        if(!!dispositivo) {
            return dispositivo.where.reduce( getLastElementOr, {name: 'Nessuna Stanza'} ).name;
        }
        return '';
    }

    protected getDeviceName(trigger: EventTriggerChannelDeviceType | ActionChannelDeviceType) {
        let dispositivo: DeviceType | undefined;
        if( typeof trigger.device === 'number' ) {
            dispositivo = this.devices.find((dispositivo: DeviceType) => dispositivo.id === trigger.device);
        }
        else {
            dispositivo = trigger.device;
        }
        if(!!dispositivo) {
            return dispositivo.name;
        }
        return '';
    }

    protected getAction(deviceAction: ActionChannelDeviceType) {

        if( !!(deviceAction as unknown as any).action ) {
            return (deviceAction as unknown as any).action.split(':')[0];
        };

    }

    // valore del comando anche con ritardo e durata (POWER:ON;delay=30 è acceso)
    protected getActionValue(deviceAction: ActionChannelDeviceType) {
        return readScenarioAction((deviceAction as unknown as any).action).value;
    }



    protected delete() {
        this.openConfirmDeletion = true;
    }
}
