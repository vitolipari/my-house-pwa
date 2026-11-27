import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {getLastElementOr} from '../../utils/array-util';


export type SVG_PointType = { x: number; y: number; };
export type SVG_LineType = {
    from: SVG_PointType;
    to: SVG_PointType;
    d?: string;
    width?: number | string;
    color?: string;
};

/**
 * etichetta sopra le tacche: value nella stessa unità di min e max, label è il testo mostrato
 */
export type SliderStepType = { value: number; label: string; };

@Component({
    selector: 'slider-lines',
    imports: [],
    standalone: true,
    templateUrl: './slider-lines.component.html',
    styleUrl: './slider-lines.component.css',
})
export class SliderLinesComponent implements OnInit {

    /**
     * Numero di segmenti
     */
    @Input({required: false}) steps: SliderStepType[] = [{value: 0, label: '0'}, {value: 10800, label: '10800'}];
    fullSteps: {label: string; x: number; y: number;}[] = [];
    segments: SVG_LineType[] = [];
    @Input({required: false}) currentLabel: string = "";

    /**
     * tipo di valore assegnato ai segmenti
     */
    @Input({required: false}) scale: "LOGARITMIC" | "LINEAR" = "LINEAR";

    /**
     * valore della prima e dell'ultima tacca
     */
    @Input({required: false}) min: number = 0;
    @Input({required: false}) max: number = 10800;

    @Output() valueChange: EventEmitter<number> = new EventEmitter<number>();


    /**
     * quanti livelli di step intermedi
     * inteso come potenza del 2.
     * fra una tacca e la tacca successiva quante tacche intermedie servono?
     */
    @Input({required: false}) middleStepsLevel: number = 4;
    @Input({required: false}) middleStepsCenter: boolean = true;

    @Input({required: false}) color: string = getComputedStyle(document.body).getPropertyValue("--color-text-0");

    mainLines: SVG_LineType[] = [];

    /**
     * posizione del mouse e dello scorrimento quando inizia il trascinamento; null se non si trascina
     */
    inizioX: number | null = null;
    inizioScroll: number = 0;

    /**
     * prime tacche da una unità ciascuna nella scala logaritmica; 0 se la scala è lineare
     */
    taccheLineari: number = 0;

    d: string = '';

    ngOnInit(): void {

        let totalSegment = (this.steps.length -1) * Math.pow( 2, this.middleStepsLevel  );
        let levels: number[] = [];

        let level: number = 0;
        while( (this.middleStepsLevel - level) > -1 ) {
            levels.push(Math.pow( 2, this.middleStepsLevel - level ));
            level++;
        }
        this.segments = new Array( totalSegment )
            .fill(null)
            .map((segment: any, segIndex: number) => {

                let segmentLevel = -1;
                levels
                    .forEach((l: number, lIndex: number) => {
                        if( segmentLevel === -1 ) {
                            if((segIndex % l) === 0) segmentLevel = lIndex;
                        }
                    })
                ;
                if( segmentLevel === -1 ) segmentLevel = 1;
                let w = (this.middleStepsLevel - (segmentLevel || 1) + 1) / 2;
                if( w > 2 ) w = 2;

                let x = 0 + (segIndex * (100 / totalSegment));
                let startY =
                    (!!this.middleStepsCenter)
                        ? (20 + (1 * (( segmentLevel) || 1)))
                        : (20 + (2 * (( segmentLevel) || 1) -1))
                ;
                let currentLine: SVG_LineType = {
                    from: {
                        x: x,
                        y: startY
                    },
                    to: {
                        x: x,
                        y:
                            (!!this.middleStepsCenter)
                                ? (40 - (1 * (( segmentLevel) || 1) -1))
                                : (39)
                    },
                    width: w,
                    d: `M${ x } ${ startY } V29`,
                    color: this.color
                };

                return currentLine;
            })
        ;



        let w = (this.middleStepsLevel) / 2;
        if( w > 2 ) w = 2;
        let x = 0 + (this.segments.length * (100 / totalSegment));
        let startY = 10;

        this.segments.push({
            from: {
                x: x,
                y: startY
            },
            to: {
                x: x,
                y: 39
            },
            width: w,
            d: `M${ x } ${ startY } V29`,
            color: this.color   // '#d00'
        });

        // posizione delle etichette: la tacca che ha il valore dell'etichetta, con l'inversa del calcolo di onScroll
        let N: number = totalSegment;
        let S: number = this.max - this.min;

        this.taccheLineari = 0;
        if( this.scale === 'LOGARITMIC' && S > N ) {
            this.taccheLineari = 1;
            while( this.taccheLineari * (1 + Math.log(S / this.taccheLineari)) < N ) {
                this.taccheLineari++;
            }
        }

        this.fullSteps = this.steps
            .map((step: SliderStepType) => {

                let u: number = step.value - this.min;
                let L: number = this.taccheLineari;
                let tacca: number = u * N / S;

                if( L > 0 ) {
                    tacca = u;
                    if( u > L ) {
                        tacca = L + (N - L) * Math.log(u / L) / Math.log(S / L);
                    }
                }

                return {
                    label: step.label,
                    x: tacca * 100 / N,
                    y: 10
                };
            })
        ;

    }

    // valore della tacca al centro del contenitore, lineare o logaritmico secondo scale
    onScroll(event: Event): void {

        let contenitore: HTMLElement = event.target as HTMLElement;
        let N: number = this.segments.length - 1;
        let tacca: number = contenitore.scrollLeft / (contenitore.scrollWidth - contenitore.clientWidth) * N;
        let S: number = this.max - this.min;
        let valore: number = tacca * S / N;

        let L: number = this.taccheLineari;
        if( L > 0 ) {
            valore = tacca;
            if( tacca > L ) {
                valore = L * Math.pow(S / L, (tacca - L) / (N - L));
            }
        }

        if( !this.currentLabel || (this.currentLabel === '') ) {
            this.currentLabel = ''+ (this.min + Math.round(valore));
        }
        this.valueChange.emit(this.min + Math.round(valore));
    }


    // trascinamento col mouse: sposta lo scorrimento di quanto si è mosso il puntatore; al tocco scorre già il browser
    onDrag(event: PointerEvent): void {

        if( event.pointerType !== 'mouse' ) {
            return;
        }

        let contenitore: HTMLElement = event.currentTarget as HTMLElement;

        if( event.type === 'pointerdown' ) {
            this.inizioX = event.clientX;
            this.inizioScroll = contenitore.scrollLeft;
            contenitore.setPointerCapture(event.pointerId);
        }

        if( event.type === 'pointermove' && this.inizioX !== null ) {
            contenitore.scrollLeft = this.inizioScroll - (event.clientX - this.inizioX);
        }

        if( event.type === 'pointerup' ) {
            this.inizioX = null;
        }
    }



}
