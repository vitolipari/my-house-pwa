import {Component, inject, Input, signal} from '@angular/core';
import { Segment } from "./segment";
import {EventTimerType, MINUTES_IN_A_DAY, TimerType} from '../timer.models';
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
import {Router} from '@angular/router';
import {TimerApiService} from '../timer-api';
import {firstValueFrom} from 'rxjs';


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
        SwitcherComponent
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

    protected readonly inWaiting = signal<boolean>(false);

    private readonly timerApi = inject(TimerApiService);
    private readonly router = inject(Router);

    @Input()
    set timerData(data: TimerType) {
        this.timer = { ...this.timer, ...data };
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
        return firstValueFrom(this.timerApi.newTimer(this.timer))
            .then((data: EventTimerType[]) => {

                this.router.navigate(
                    ['/rooms-page'],
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


    protected openMenu() {

    }
}
