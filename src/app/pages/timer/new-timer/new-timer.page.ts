import {Component, Input} from '@angular/core';
import { Segment } from "./segment";
import {MINUTES_IN_A_DAY, TimerType} from '../timer.models';
import {bitsToBase64} from '../../../utils/base64';
import {InputText} from 'primeng/inputtext';
import {Button, ButtonModule} from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import {Slider} from 'primeng/slider';
import { SliderModule } from 'primeng/slider';
import { DatePickerModule } from 'primeng/datepicker';
import {TimerWheel} from './timer-wheel';
import {FormsModule} from '@angular/forms';


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
        FormsModule
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
        name: 'timer',
        dayMinutes: [],
        start: '01/01',
        end: '31/12',
        dateFormat: 'mmdd',
        weekDays: [true, true, true, true, true, false, false],
        avoidDate: []
    }
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


        console.log( this.timer.dayMinutes );
        console.log( this.dayTimer );




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



}
