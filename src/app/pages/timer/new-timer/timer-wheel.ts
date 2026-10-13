import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {JsonPipe} from '@angular/common';
import moment from 'moment';
import { base64ToBits } from "../../../utils/base64";
import {Segment} from './segment';
import { MINUTES_IN_A_DAY } from "../timer.models";
import {Avoid} from './avoid';
import {Ok} from './ok';


@Component({
  selector: 'timer-wheel',
    imports: [
        Avoid,
        Ok
    ],
  templateUrl: './timer-wheel.html',
  styleUrl: './timer-wheel.scss',
  standalone: true
})
export class TimerWheel implements OnInit {

  // CONFIG
  circleOuterRay: number = 90;
  circleInnerRay: number = 55;
  elements: Segment[] = [];
  center: {x: number; y: number} = {x: 100, y: 100};
  audioCtx?: AudioContext;
  MINUTES_IN_A_DAY: number = MINUTES_IN_A_DAY;
  currentMinuteColor: string      = '#2ecdff';  // getComputedStyle(document.body).getPropertyValue("--sky-color");
  activeMinuteColor: string       = '#e3b509';
  disabledMinuteColor: string     = '#cccccc';
  midnightLineColor: string       = '#0001';
  midnightIndicatorColor: string  = '#ddd';



  // PI: number = Math.PI;


  // input
  _minuteScale!: number;
  @Input()
  set minuteScale(v: number) {
    this._minuteScale = v;

    let dayTimerBits: boolean[] = base64ToBits( this.rawDayTimer, MINUTES_IN_A_DAY);
    this.createSegments(dayTimerBits);
  }


  rawDayTimer!: string;
  @Input()
  set timerDay( dayTimer: string ) {
    this.rawDayTimer = dayTimer;

    // TODO
    // let dayTimerBits: boolean[] = base64ToBits( this.rawDayTimer, MINUTES_IN_A_DAY);


  }

  @Input() isDebug: boolean = false;


  // dom
  @ViewChild('svg', { static: true }) svgRef!: ElementRef<SVGSVGElement>;
  @ViewChild('wheel', { static: true }) dialRef!: ElementRef<SVGSVGElement>;
  @ViewChild('movementPos', { static: true }) divRef!: ElementRef<HTMLDivElement>;

  // output
  @Output() rotate = new EventEmitter<number>();
  @Output() rotationChange = new EventEmitter<number>();
  @Output() onTimerSet = new EventEmitter<Segment[]>();

  // SNAP CONFIG
  enableSnap = true;
  snapDegrees = 360 / ((24 * 60) * this._minuteScale); // = 3.75° se 15min

  // STATE
  // rotation = 360 * this._minuteScale / MINUTES_IN_A_DAY;
  currentSegmeent: number = 0;
  rotation = 0;
  lastAngle = 0;
  dragging = false;
  velocity = 10;
  inertiaFrame?: number;
  buttonStateActive: boolean = false;
  deactivationButtonStateActive: boolean = false;

  currentX: number = 0;
  currentY: number = 0;
  angle: number = 0;

  // FISICA
  friction = 0.985;  // 0.985; // <— più basso = si ferma prima
  velocityThreshold = 0.5;  // 0.06

  segments = Array.from({ length: (MINUTES_IN_A_DAY / this._minuteScale) });

  constructor() {


  }

  ngOnInit(): void {
    this.createSegments();
  }


  createSegments(bits?: boolean[]) {

    this.elements =
      Array(MINUTES_IN_A_DAY / this._minuteScale)
        .fill(null)
        .map( (e: Segment, i: number) => ({
          minuteIndex: i * this._minuteScale,
          active: (
            !!bits
              ? ( !!bits[ (i * this._minuteScale) ] )
              : false
          ),
          width: (2 * Math.PI / (MINUTES_IN_A_DAY / this._minuteScale)) * this.circleInnerRay,
          height: this.circleOuterRay - this.circleInnerRay
        }));
    ;
    this.currentSegmeent = this.timeToMinute(`${ (new Date()).getHours() }:${ (new Date()).getMinutes() }`);
  }



  /* ================= POINTER EVENTS ================= */

  onPointerDown(e: PointerEvent) {
    this.stopInertia();
    this.dragging = true;
    this.lastAngle = this.getAngle(e);
    this.dialRef.nativeElement.setPointerCapture(e.pointerId);
  }

  onPointerMove(e: PointerEvent) {
    if (!this.dragging) return;

    const angle = this.getAngle(e);
    let delta = angle - this.lastAngle;

    if( !isNaN(delta) ) {
      // normalizza salto angolare
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      this.rotation += delta;

      // this.rotation = this.rotation % 360;
      this.rotation = ((this.rotation % 360) + 360) % 360;

      this.velocity = delta;
      this.lastAngle = angle;

      this.emit();

    }
  }

  onPointerUp() {
    this.dragging = false;

    if (this.enableSnap) {
      const snapped = this.snapRotation(this.rotation);
      if ((snapped !== this.rotation) && !isNaN(snapped)) {
        this.rotation = snapped;
        // this.rotation = this.rotation % 360;
        this.rotation = ((this.rotation % 360) + 360) % 360;
        this.playClick();
        this.haptic();
        this.emit();
      }
    }

    // soglia per l'inerzia

    this.startInertia();
  }

  /* ================= INERZIA ================= */

  startInertia() {
    const animate = () => {
      this.velocity *= this.friction;
      this.rotation += this.velocity;
      // this.rotation = this.rotation % 360;
      this.rotation = ((this.rotation % 360) + 360) % 360;

      this.emit();

      if (Math.abs(this.velocity) > this.velocityThreshold) {
        this.inertiaFrame = requestAnimationFrame(animate);
      } else if (this.enableSnap) {
        this.rotation = this.snapRotation(this.rotation);
        // this.rotation = this.rotation % 360;
        this.rotation = ((this.rotation % 360) + 360) % 360;
        this.playClick();
        this.haptic();
        this.emit();
      }
    };
    this.inertiaFrame = requestAnimationFrame(animate);
  }

  stopInertia() {
    if (this.inertiaFrame) {
      cancelAnimationFrame(this.inertiaFrame);
      this.inertiaFrame = undefined;

    }
    this.emitTimerData();
  }

  /* ================= UTILS ================= */


  getAngle(e: PointerEvent): number {
    const rect = this.svgRef.nativeElement.getBoundingClientRect();
    let x = e.clientX - rect.left - this.center.x;
    let y = e.clientY - rect.top - this.center.y;

    if( !!this.isDebug ) {
      this.divRef.nativeElement.style.left = e.clientX + 'px';
      this.divRef.nativeElement.style.top = e.clientY + 'px';
    }

    const point = new DOMPoint(e.clientX, e.clientY);
    const ctm = this.svgRef.nativeElement.getScreenCTM();

    if (!!ctm) {
      const svgPoint = point.matrixTransform(ctm.inverse());

      let x = svgPoint.x - this.center.x;
      let y = svgPoint.y - this.center.y;

      this.currentX = svgPoint.x;
      this.currentY = svgPoint.y;
      this.angle = Math.atan2(y, x) * 180 / Math.PI;

      return Math.atan2(y, x) * 180 / Math.PI;
    }

    return Math.atan2(y, x) * 180 / Math.PI;
  }

  /**
   * nel campo this.rotation c'é il valore della rotazione espresso in
   * sessagesimali
   */
  emit() {

    if( !isNaN( this.rotation ) /*&& (this.rotation > 0)*/ ) {

      let currentMinuteIndex: number = Math.round(this.rotation / ((360 / (MINUTES_IN_A_DAY / this._minuteScale))));
      this.rotationChange.emit(currentMinuteIndex);
      // console.log('emesso '+ currentMinuteIndex);

      if( this.currentSegmeent !== currentMinuteIndex ) {

        this.currentSegmeent = currentMinuteIndex;
        this.activeElement();

        // this.emitTimerData();
        this.emitTimerData();

        this.playClick();
        this.haptic();
      }

    }

  }

  getSegmentRotation(i: number) {
    return `rotate(${(360 / (MINUTES_IN_A_DAY / this._minuteScale)) * i} ${this.center.x} ${this.center.y})`;
  }

  snapRotation(angle: number): number {
    if(!isNaN( Math.round(angle / this.snapDegrees) * this.snapDegrees )) {
      return Math.round(angle / this.snapDegrees) * this.snapDegrees;
    }
    return angle;
  }


  playClick() {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
    }

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'square';
    osc.frequency.value = 1000;

    gain.gain.value = 0.05;

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.02);
  }

  haptic() {
    if ('vibrate' in navigator) {
      navigator.vibrate(8); // millisecondi
    }
  }


  minuteToTime(minute: number) {

    if (!Number.isInteger(minute) || minute < 0 || minute > 1439) {
      throw new Error(`Minuto ${ minute } fuori range (0–1439)`);
    }

    const hours: number = Math.floor(minute / 60);
    const minutes: number = minute % 60;

    return {
      hours,
      minutes,
      text: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
    };
  }



  timeToMinute( time: string ) {
    let hh, mm;
    [hh, mm] = time.split(':');

    let currentMinuteIndex: number = Math.round(this.rotation / ((360 / (MINUTES_IN_A_DAY / this._minuteScale))));
    let minuteIndex = Math.round(((parseInt( hh ) * 60) + (parseInt(mm))) / this._minuteScale);
    this.rotation = minuteIndex * this._minuteScale;

    return minuteIndex;
  }

  activationButtonChengeState() {

      console.log('activationButtonChengeState');

    this.buttonStateActive = !this.buttonStateActive;
    this.deactivationButtonStateActive = false;

    this.activeElement();
  }

  activeElement() {

    if( !!this.buttonStateActive ) {

      this.elements
        .filter((seg: Segment) => seg.minuteIndex === (this.currentSegmeent * this._minuteScale))
        .reduce((accSeg: Segment, currentSeg: Segment) => currentSeg, this.elements[0])
        // .active = !!this.buttonStateActive;
        .active = true
      ;
    }

  }

  deActiveElement() {

    if( !!this.deactivationButtonStateActive ) {

      this.elements
        .filter((seg: Segment) => seg.minuteIndex === (this.currentSegmeent * this._minuteScale))
        .reduce((accSeg: Segment, currentSeg: Segment) => currentSeg, this.elements[0])
        // .active = !!this.buttonStateActive;
        .active = false
      ;
    }

  }

  clearActivationButton() {
    this.elements
      .forEach((seg: Segment) => {
        seg.active = false;
      })
    ;
  }

  // TODO
  deActivationButtonChengeState() {

    this.buttonStateActive = false;
    this.deActiveElement();

    // if( !!this.deactivationButtonStateActive ) {
    //   console.log( (!!this.buttonStateActive ? 'attivo' : 'disattivo') +' il minuto '+ this.minuteToTime(this.currentSegmeent * this._minuteScale).text, this.currentSegmeent);
    //
    //   console.log(this.currentSegmeent, );
    //
    //   this.elements
    //     .filter((seg: Segment) => seg.minuteIndex === (this.currentSegmeent * this._minuteScale))
    //     .reduce((accSeg: Segment, currentSeg: Segment) => currentSeg, this.elements[0])
    //     // .active = !!this.buttonStateActive;
    //     .active = false
    //   ;
    // }

  }

  setBit(bitset: Uint8Array, index: number): void {
    const byte = index >> 3;      // index / 8
    const bit = index & 7;        // index % 8
    bitset[byte] |= 1 << (7 - bit);
  }

  clearBit(bitset: Uint8Array, index: number): void {
    const byte = index >> 3;
    const bit = index & 7;
    bitset[byte] &= ~(1 << (7 - bit));
  }

  getBit(bitset: Uint8Array, index: number): boolean {
    const byte = index >> 3;
    const bit = index & 7;
    return ((bitset[byte] >> (7 - bit)) & 1) === 1;
  }

  uint8ArrayToBase64(uint8: Uint8Array): string {
    let binary = "";
    const chunkSize = 0x8000; // 32 KB

    for (let i = 0; i < uint8.length; i += chunkSize) {
      binary += String.fromCharCode(
        ...uint8.subarray(i, i + chunkSize)
      );
    }

    return btoa(binary);
  }




  // TODO da spostare nell'altro file


  emitTimerData() {
    /**
     * Tutti i minuti dell'anno sono attivi/disattivi
     * i minuti dell'anno sono 527'040 contando un anno bisestile
     * un minuto rappresenta un bit
     * tutti i bit vengono rappresentati in base64
     */

    const bitset = new Uint8Array(MINUTES_IN_A_DAY / 8);

    // minuti attivi calcolato con il minuteScale
    this.elements
      .forEach((el: Segment, index: number) => {
        if( el.active ) {
          this.setBit(bitset, index);
        }
        else {
          this.clearBit(bitset, index);
        }
      })
    ;


    // let minuteIndexAtStart: number = 0;
    // let minuteIndexAtEnd: number = BIT_COUNT;


    // TODO da ciclare dall'inizio del timer alla fine
    // let fromDate: string = moment().format(DATE_TIME_FORMAT);
    // let toDate: string = moment().add(1, 'day').format(DATE_TIME_FORMAT);
    // const begin = moment(fromDate, DATE_TIME_FORMAT, true); // strict parsing
    // const end = moment(toDate, DATE_TIME_FORMAT, true); // strict parsing

    // if (!m.isValid()) {
    //   throw new Error("Formato data non valido");
    // }

    // const startOfYear = begin.clone().startOf("year");

    // differenza in minuti (i secondi vengono troncati)
    // const minuteOfFromTime = begin.diff(startOfYear, "minutes");
    // const minuteOfToTime = end.diff(startOfYear, "minutes");


    // TODO ripetizioni settimanali



    // TODO ciclare tutti i 500 mila minuti
    // this.elements
    //
    //   // .filter((el: Segment) => ( (el.minuteIndex >= minuteOfFromTime) && (el.minuteIndex <= minuteOfToTime) ))
    //
    //   .forEach((el: Segment) => {
    //
    //
    //     if( (el.minuteIndex >= minuteOfFromTime) && (el.minuteIndex <= minuteOfToTime) ) {
    //       this.setBit(bitset, el.active);
    //     }
    //     else {
    //
    //     }
    //
    //   })
    // ;

    // serializza
    // const timer = this.uint8ArrayToBase64(bitset);
    // let timerData: DayTimerData = {
    //   timeFormat: DATE_TIME_FORMAT,
    //   dataFormat: 'BASE64',
    //   from: fromDate,
    //   to: toDate,
    //   dayData: timer
    // };

    // this.onTimerSet.emit(this.uint8ArrayToBase64(bitset));


    this.onTimerSet.emit(this.elements);
  }
}
