import {Component, inject, Input, signal} from '@angular/core';
import { Segment } from "./segment";
import {EventTimerType, FullTimerType, MINUTES_IN_A_DAY, TimerType} from '../timer.models';
import {bitsToBase64} from '../../../utils/base64';
import {InputText} from 'primeng/inputtext';
import {Button, ButtonModule} from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import {Slider} from 'primeng/slider';
import { SliderModule } from 'primeng/slider';
import { DatePickerModule } from 'primeng/datepicker';
import {TimerWheel} from './timer-wheel';
import {FormsModule} from '@angular/forms';
import {PageTitleComponent} from '../../../components/page-title.component/page-title.component';
import {SwitcherComponent} from '../../../components/switcher/switcher.component';
import {RoomsApiService} from '../../rooms/rooms-api';
import {ActivatedRoute, Router} from '@angular/router';
import {TimerApiService} from '../timer-api';
import {firstValueFrom} from 'rxjs';
import {PermissionService} from '../../../services/permission.service';
import {ZoneType} from '../../devices/devices.models';
import {getLastElementOr} from '../../../utils/array-util';
import {Drawer} from 'primeng/drawer';
import {AnelloGiornata} from '../../../components/anello-giornata/anello-giornata';


@Component({
  selector: 'app-new-timer.page',
    imports: [
        InputText,
        ButtonModule,
        InputTextModule,
        Slider,
        TimerWheel,
        DatePickerModule,
        SliderModule,
        Button,
        FormsModule,
        PageTitleComponent,
        SwitcherComponent,
        Drawer,
        AnelloGiornata
    ],
  templateUrl: './new-timer.page.html',
  styleUrl: './new-timer.page.css',
})
export class NewTimerPage {




    rotateEvent!: number;
    rotateChange!: number;
    minuteScale: number = 10;
    dayTimerRaw!: Segment[];
    dayTimer!: string;
    isDebug: boolean = false;

    timer: TimerType = {
        enabled: true,
        name: 'timer',
        dayMinutes: [],
        start: '01/01',
        end: '31/12',
        dateFormat: 'mmdd',
        weekDays: [true, true, true, true, true, false, false],
        avoidDate: [],
        isHolidays: false
    }

    detailsTimer!: (FullTimerType & { sectors: number[][]; arcs: string[] });

    circle = {
        x: 50,
        y: 50,
        // 45 e non 50: con stroke-width 10 metà del tratto uscirebbe dal viewBox 0 0 100 100
        r: 35,
        width: 20
    };

    readonly isInDetailsMode = signal<boolean>(false);
    readonly isInEditMode = signal<boolean>(false);
    readonly isInDeleteTimerInWaiting = signal<boolean>(false);
    protected readonly inWaiting = signal<boolean>(false);



    private readonly timerApi = inject(TimerApiService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly permissionService = inject(PermissionService);
    // private readonly albaTramontoService = inject(AnelloGiornataService);


    readonly routeInfo = this.route.snapshot.data; // oggetto data della rotta = accessControl.permission
    readonly pathVariables = this.route.snapshot.params; // oggetto con i pathVariables
    readonly routeParamater = this.route.snapshot.queryParams; // oggetto con la query string
    readonly navigationData = this.router.currentNavigation()?.extras.state;    // passato dalla navigazione
    openConfirmDeletion: boolean = false;



    @Input()
    set timerData(data: TimerType) {
        this.timer = { ...this.timer, ...data };
    }


    constructor() {
        console.log(this.routeInfo);
        console.log(this.pathVariables);
        console.log(this.routeParamater);
        console.log(this.navigationData);


        if( !!this.routeInfo && !!this.routeInfo['accessControl'] && !!this.routeInfo['accessControl'].isReadOnly ) {
            // siamo nella pagina di sola lettura

            this.isInDetailsMode.update(() => true);


            // const sole = this.albaTramontoService.calcolaAlbaTramonto(new Date(), 41.9028, 12.4964);
            //
            // if (sole !== null) {
            //     this.alba = this.albaTramontoService.oraDecimaleNelFuso(sole.alba, 'Europe/Rome');
            //     this.tramonto = this.albaTramontoService.oraDecimaleNelFuso(sole.tramonto, 'Europe/Rome');
            // }



            if( !this.navigationData || !this.navigationData['details'] ) {
                // bisogna caricare i dati della stanza
                // perché non sono arrivati dalla navigazione interna

                console.log('dati del timer assenti, parte la chiamata');

                this.inWaiting.set(true);

                firstValueFrom(this.timerApi.searchTimers({id: this.pathVariables['id']}))
                    .then((timers: FullTimerType[]) => {

                        let timer = (timers as (FullTimerType & { sectors: number[][]; arcs: string[]; })[]).reduce(getLastElementOr, null);

                        // il Core non manda arcs: senza inizializzarlo la push fallisce
                        timer.arcs = [];

                        timer.sectors =
                            timer.slots
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
                                .map(([startAngle, stopAngle]: [number, number]) => {

                                    if( !isNaN(startAngle) && !isNaN(stopAngle) ) {

                                        // coordinate svg
                                        // console.log([startAngle, stopAngle]);
                                        const ampiezza = stopAngle - startAngle;

                                        // Questa funzione gestisce archi maggiori di 0 e minori di un giro.
                                        if (!(ampiezza > 0 && ampiezza < 2 * Math.PI)) {
                                            console.log("L'ampiezza deve essere compresa tra 0 e 2π, esclusi");
                                        }

                                        const x1 = this.circle.x + (this.circle.r * Math.cos(startAngle));
                                        const y1 = this.circle.y + (this.circle.r * Math.sin(startAngle));

                                        const x2 = this.circle.x + (this.circle.r * Math.cos(stopAngle));
                                        const y2 = this.circle.y + (this.circle.r * Math.sin(stopAngle));

                                        const arcoGrande = ampiezza > Math.PI ? 1 : 0;

                                        timer.arcs.push( `
                                            M ${x1} ${y1}
                                            A ${this.circle.r} ${this.circle.r} 0 ${arcoGrande} 1 ${x2} ${y2}
                                        `);
                                    }


                                    return [startAngle, stopAngle];
                                })
                        ;


                        this.detailsTimer = timer;
                        this.timer = timer;

                        this.inWaiting.update(() => false);


                    })
                    .catch((error: unknown) => {
                        console.log('errore in searchTimers');
                        console.log(error);

                        this.inWaiting.update(() => false);
                    })


            }
            else {
                // dati passati attravberso la navigazione
                this.detailsTimer = this.navigationData['details'];

                console.log('dati passati da navigazione');
                console.log(this.detailsTimer);


                this.detailsTimer.arcs = [];

                // calcolo degli archi
                this.detailsTimer.slots
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
                    .forEach(([startAngle, stopAngle]) => {

                        if( !isNaN(startAngle) && !isNaN(stopAngle) ) {

                            // coordinate svg
                            // console.log([startAngle, stopAngle]);
                            const ampiezza = stopAngle - startAngle;

                            // Questa funzione gestisce archi maggiori di 0 e minori di un giro.
                            if (!(ampiezza > 0 && ampiezza < 2 * Math.PI)) {
                                console.log("L'ampiezza deve essere compresa tra 0 e 2π, esclusi");
                            }

                            const x1 = this.circle.x + (this.circle.r * Math.cos(startAngle));
                            const y1 = this.circle.y + (this.circle.r * Math.sin(startAngle));

                            const x2 = this.circle.x + (this.circle.r * Math.cos(stopAngle));
                            const y2 = this.circle.y + (this.circle.r * Math.sin(stopAngle));

                            const arcoGrande = ampiezza > Math.PI ? 1 : 0;

                            this.detailsTimer.arcs.push( `
                                            M ${x1} ${y1}
                                            A ${this.circle.r} ${this.circle.r} 0 ${arcoGrande} 1 ${x2} ${y2}
                                        `);
                        }


                        // return [startAngle, stopAngle];
                    })
                ;

                // this.detailsTimer = this.navigationData['details'];
                this.timer = this.navigationData['details'];
            }
        }
        else {
            // siamo in nuovo timer
        }

    }


    getRotateEvent(event: number) {
        this.rotateEvent = event;
    }


    getRotateChange(minuteIndex: number) {

        // console.log('minuteIndex ', minuteIndex);

        if( !isNaN(minuteIndex) ) {
            this.rotateChange = minuteIndex;
        }


    }



    getTimerSet(dayTimerRaw: Segment[]) {


        console.log( dayTimerRaw );
        dayTimerRaw
            .forEach((seg: Segment) => {
                for( let cs = seg.minuteIndex; cs < (seg.minuteIndex + this.minuteScale); cs++) {
                    // console.log(i, cs);
                    this.timer.dayMinutes[cs] = seg.active;
                }
            })
        ;

        this.dayTimer = bitsToBase64( this.timer.dayMinutes );
        this.timer.dayMinutesPack = this.dayTimer;


        // console.log( this.timer.dayMinutes );
        // console.log( this.dayTimer );




    }


    onSlide() {
        let safeCursor: number = 0;
        while((( ( MINUTES_IN_A_DAY / this.minuteScale ) - Math.floor( MINUTES_IN_A_DAY / this.minuteScale ) ) !== 0) && (safeCursor < 100)) {
            this.minuteScale++;
            safeCursor++;
        }

        // restore timer


    }


    onSlideEnd() {

    }

    operateWeekDay(dayWeekIndex: number) {
        this.timer.weekDays[dayWeekIndex] = !this.timer.weekDays[dayWeekIndex];
    }


    protected setHolidays(event: boolean) {
        this.timer.isHolidays = !!event;
    }

    addNewTimer() {

        this.timer.enabled = true;
        this.timer.note = '';
        console.log(this.timer);
        this.inWaiting.set(true);
        return firstValueFrom(this.timerApi.newTimer(this.timer))
            .then((data: EventTimerType[]) => {

                this.router.navigate(
                    ['//timers-page'],
                    {
                        state: {
                            from: 'newTimerPage',
                            data: data
                        }
                    }
                );
            })
            .catch((error: unknown) => {
                console.log('errore in addNewRoom');
                console.log(error);
            });

    }


    // salva le modifiche con PUT /timer/:id e torna all'elenco dei timer
    updateTimer() {

        this.inWaiting.set(true);
        return firstValueFrom(this.timerApi.updateTimer(parseInt(this.pathVariables['id']), this.timer))
            .then((data: EventTimerType[]) => {

                this.inWaiting.set(false);
                this.router.navigate(
                    ['/timers-page'],
                    {
                        state: {
                            from: 'editTimerPage',
                            data: data
                        }
                    }
                );
            })
            .catch((error: unknown) => {
                console.log('errore in updateTimer della pagina timer');
                console.log(error);
                this.inWaiting.set(false);
            });

    }


    protected openMenu() {

    }

    editData() {

        // TODO: navigare in edit
        // navigare in new-timer ma con i dati passati

        // il template sblocca i campi solo leggendo isInDetailsMode: va spento qui
        this.isInDetailsMode.set(false);
        this.isInEditMode.set(true);
        console.log('is in edit abilitato');

        // la ruota legge dayTimer: il Core manda solo gli slot, quindi si ricava da lì
        if( !!this.detailsTimer ) {
            this.timer.dayMinutes = this.slotsToDayMinutes(this.detailsTimer.slots ?? []);
            this.dayTimer = bitsToBase64( this.timer.dayMinutes );
            this.timer.dayMinutesPack = this.dayTimer;
        }

    }


    // minuti attivi della giornata ricavati dagli slot HHMM del Core (2400 = fine giornata)
    slotsToDayMinutes(slots: EventTimerType[]): boolean[] {
        const hhmmToMinute = (hhmm: string | number | Date): number => {
            const text: string = ('' + hhmm).padStart(4, '0');
            return (parseInt(text.slice(0, 2)) * 60) + parseInt(text.slice(2, 4));
        };

        const dayMinutes: boolean[] = Array(MINUTES_IN_A_DAY).fill(false);

        slots
            .forEach((slot: EventTimerType) => {
                const from: number = hhmmToMinute(slot.trigger_time);
                const to: number = Math.min(hhmmToMinute(slot.slot_until), MINUTES_IN_A_DAY);

                if( !isNaN(from) && !isNaN(to) ) {
                    for( let m = from; m < to; m++ ) {
                        dayMinutes[m] = true;
                    }
                }
            })
        ;

        return dayMinutes;
    }

    protected duplicate() {
        // TODO
    }

    protected deleteTimer() {
        this.openConfirmDeletion = true;
    }


    confirmDeleteTimer() {

        this.isInDeleteTimerInWaiting.update(() => true);
        firstValueFrom(this.timerApi.deleteTimers([(this.timer as any).id || this.detailsTimer.id]))
            .then(() => {
                this.isInDeleteTimerInWaiting.update(() => false);
                this.router.navigate(['/timers-page']);
                // window.location.reload();
            })
            .catch((e) => {
                console.log(e);
            })
        ;


    }
}
