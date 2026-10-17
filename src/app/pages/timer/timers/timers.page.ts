import {Component, inject, OnInit, signal, WritableSignal} from '@angular/core';
import {PageTitleComponent} from '../../../components/page-title.component/page-title.component';
import {Router} from '@angular/router';
import {TimerApiService} from '../timer-api';
import {firstValueFrom} from 'rxjs';
import {EventTimerType, FullTimerType} from '../timer.models';
import {base64ToBits} from '../../../utils/base64';
import {JsonPipe} from '@angular/common';
import {SwitcherComponent} from '../../../components/switcher/switcher.component';
import {emoj} from '../../../utils/string-utils';
import {LongPressDirective} from '../../../directives/long-press.directive';
import {Checkbox, CheckboxChangeEvent} from 'primeng/checkbox';
import {ZoneType} from '../../devices/devices.models';
import {Button} from 'primeng/button';
import {FormsModule} from '@angular/forms';
import {InputText} from 'primeng/inputtext';


@Component({
  selector: 'app-timers.page',
    imports: [
        PageTitleComponent,
        JsonPipe,
        SwitcherComponent,
        LongPressDirective,
        Checkbox,
        Button,
        FormsModule,
        InputText
    ],
  templateUrl: './timers.page.html',
  styleUrl: './timers.page.css',
})
export class TimersPage implements OnInit {

    circle = {
        x: 50,
        y: 50,
        // 45 e non 50: con stroke-width 10 metà del tratto uscirebbe dal viewBox 0 0 100 100
        r: 40,
        width: 15
    };

    protected isWeekDayActive: boolean[] = [false, false, false, false, false, false, false];
    readonly emoj = emoj;
    searchName: string = ''

    protected readonly timers = signal<(FullTimerType & { sectors: number[][]; arcs: string[]; })[]>([]);
    isInWaiting = signal(false);
    isWaitingTimer = signal([0]);
    readonly isInSelection = signal<boolean>(false);

    readonly router = inject(Router);
    readonly timerApi: TimerApiService = inject(TimerApiService);
    // signal: in modalità zoneless una proprietà semplice aggiornata in un then non ridisegna il template
    private selectedTimers: (FullTimerType & { sectors: number[][]; arcs: string[] })[] = [];
    protected readonly isInDeleteMultiTimersInWaiting = signal<boolean>(false);
    protected readonly isInSearchWaiting = signal<boolean>(false);

    protected addNewTimer() {
        this.router.navigate(
            ['/new-timer'],
            {
                state: {
                    from: 'timersPage'
                }
            }
        );
    }

    ngOnInit(): void {

        this.isInWaiting.update(() => true);
        this.searchTimers();

    }


    searchTimers() {

        /*
        {
            id?: number | number[];
            name?: string;
            almostStartAt?: string | number;
            almostStopAt?: string | number;
            isInHolidaysToo?: boolean;
            pageSize?: number;
            pageNumber?: number;
        }
         */
        return (
            firstValueFrom(this.timerApi.searchTimers({name: this.searchName ?? undefined}))
                .then((timers: FullTimerType[]) => {

                    const list = timers as (FullTimerType & { sectors: number[][]; arcs: string[]; })[];
                    list
                        .forEach((timer: (FullTimerType & { sectors: number[][]; arcs: string[]; })) => {

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
                                        .map(([startAngle, stopAngle]) => {

                                            if( !isNaN(startAngle) && !isNaN(stopAngle) ) {

                                                // coordinate svg
                                                console.log([startAngle, stopAngle]);
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

                                                timer.arcs.push( `
                                                    M ${x1} ${y1}
                                                    A ${this.circle.r} ${this.circle.r} 0 ${arcoGrande} 1 ${x2} ${y2}
                                                `);
                                            }


                                            return [startAngle, stopAngle];
                                        })
                            ;

                            // timer.weekDays



                        })
                    ;


                    this.timers.set(list);
                    this.isInWaiting.update(() => false);
                    console.log(list);
                    return list;
                })
                .catch((error: unknown) => {
                    console.log('errore in searchTimers');
                    console.log(error);

                    this.isInWaiting.update(() => false);
                })
        );

    }


    protected isTimerInWaiting(timer: FullTimerType & { sectors: number[][]; arcs: string[] }) {
        return (this.isWaitingTimer().find((t) => t === timer.id));
    }

    protected toggleEnableTimer(timer: FullTimerType & { sectors: number[][]; arcs: string[] }, event: boolean) {
        this.isWaitingTimer.update((timmer) => [...this.isWaitingTimer(), timer.id]);
        firstValueFrom(this.timerApi.toggleTimer(timer.id, event))
            .then(() => {
                this.isWaitingTimer.update((timmer) => this.isWaitingTimer().filter((iwt: number) => iwt !== timer.id));
                this.timers.update((timers) => {
                    const index = timers.findIndex((t) => t.id === timer.id);
                    if (index !== -1) {
                        timers[index].enabled = event;
                    }
                    return timers;
                });
            })
            .catch((e) => {
                console.log(e);
            })
        ;

    }

    protected onLongPress(timers: WritableSignal<(FullTimerType & { sectors: number[][]; arcs: string[] })[]>) {
        this.isInSelection.set(true);
    }

    toggleSelctedTimers(timer: (FullTimerType & { sectors: number[][]; arcs: string[] }), event: CheckboxChangeEvent) {

        this.selectedTimers =
            this.selectedTimers.filter((selected: (FullTimerType & { sectors: number[][]; arcs: string[] }),) => selected.id !== timer.id);
        if (!!event.checked) {
            this.selectedTimers.push(timer);
        }

        console.log(this.selectedTimers);
    }

    stopPropagation(event: MouseEvent) {
        event.stopPropagation();
    }

    protected deleteMultiTimers() {
        this.isInDeleteMultiTimersInWaiting.update(() => true);
        firstValueFrom(this.timerApi.deleteTimers(this.selectedTimers.map((t: (FullTimerType & { sectors: number[][]; arcs: string[] })) => t.id)))
            .then(() => {
                this.isInDeleteMultiTimersInWaiting.update(() => false);
                this.router.navigate(['/timers-page']);
                window.location.reload();
            })
            .catch((e) => {
                console.log(e);
            })
        ;
    }

    protected gotoTimerPage(timer: FullTimerType & { sectors: number[][]; arcs: string[] }) {
        this.router.navigate(['/timer-page', timer.id], {
            queryParams: {},
            state: {
                details: timer
            }
        });
    }
}
