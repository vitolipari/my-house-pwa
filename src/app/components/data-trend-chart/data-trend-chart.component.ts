import {
    ChangeDetectionStrategy,
    Component,
    ElementRef, HostListener, input,
    Input,
    OnChanges,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import {getLastElementOr} from '../../utils/array-util';


// barre del semicerchio: il numero resta fra questi due limiti qualunque sia l'intervallo delle misure
const MIN_BARS = 10;
const MAX_BARS = 30;

// canvas per cui il disegno è pensato (le misure originali di historicChartOptions): il disegno cresce con zoom
const BASE_WIDTH = 250;
const BASE_HEIGHT = 100;


@Component({
    selector: 'data-trend-chart',
    imports: [],
    templateUrl: './data-trend-chart.component.html',
    standalone: true,
    styleUrl: './data-trend-chart.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTrendChartComponent implements OnChanges {

    @Input() data: number[] = [];
    @ViewChild("dataTrendChart", {static: true, read: ElementRef}) canvas!: ElementRef<HTMLCanvasElement>;
    area: any;
    @Input() placeholderColor: string = '#35f8';
    @Input() activeColor: string = '#35ff';
    @Input() ray: number = 50;
    @Input() wideRay: number = 25;
    length: number = 0;
    @Input() previousActiveColor: string = '#35fa';
    @Input() previousPaceholderColor: string = '#35f5';
    @Input() previousRay: number = 38;
    @Input() previousWideRay: number = 10;
    @Input() avg: number = 0;
    @Input() ths: number = 42;
    @Input() avgColor: string = '#3f5a';
    @Input() thsColor: string = '#f353';
    @Input() minFont: string = '14px Helvetica';
    @Input() mainFont: string = '14px Helvetica';
    @Input() measureUnit: string = '';
    @Input() avgFont: string = '';

    @Input() width: number | string = 250;
    @Input() height: number | string = 200;


    ngOnChanges(changes: SimpleChanges): void {
        // width e height accettano anche misure CSS: se Number() è un numero sono pixel, ogni altra stringa passa com'è
        this.canvas.nativeElement.style.width = isNaN(Number(this.width)) ? ''+ this.width : ''+ Number(this.width) +'px';
        this.canvas.nativeElement.style.height = isNaN(Number(this.height)) ? ''+ this.height : ''+ Number(this.height) +'px';

        this.draw();
    }


    // con una misura in percentuale la larghezza reale cambia con la finestra: il disegno va rifatto
    @HostListener('window:resize')
    onResize(): void {
        this.draw();
    }


    draw(): void {

        // i pixel del disegno si leggono dalla misura reale dello stile: riassegnare width a un canvas già disegnato lo svuota
        this.canvas.nativeElement.width = this.canvas.nativeElement.clientWidth;
        this.canvas.nativeElement.height = this.canvas.nativeElement.clientHeight;

        // il disegno cresce con il canvas: si tiene il fattore più piccolo, così non esce né in larghezza né in altezza
        let zoom: number = this.canvas.nativeElement.width / BASE_WIDTH;
        if( zoom > this.canvas.nativeElement.height / BASE_HEIGHT ) {
            zoom = this.canvas.nativeElement.height / BASE_HEIGHT;
        }

        let data = JSON.parse(JSON.stringify(this.data));
        const min =
            data
                .sort((x: number, y: number) => {
                    if( x > y ) return -1;
                    return 1;
                })
                .reduce(getLastElementOr, 0)
        ;
        const max =
            data
                .sort((x: number, y: number) => {
                    if( x < y ) return -1;
                    return 1;
                })
                .reduce(getLastElementOr, 0)
        ;

        // senza scala (un solo valore o valori tutti uguali) niente barre: si scrive almeno il valore attuale
        if( this.data.length < 2 || max === min ) {
            // con una serie vuota non si scrive nulla
            if( this.data.length > 0 ) {
                let noScaleValue: string = this.data[this.data.length -1] + this.measureUnit;
                this.area = this.canvas.nativeElement.getContext('2d');
                this.area.translate(this.canvas.nativeElement.width / 2, this.canvas.nativeElement.height - (10 * zoom));
                this.area.scale(zoom, zoom);
                this.area.font = this.mainFont;
                this.area.textBaseline = "middle";
                this.area.fillStyle = this.activeColor;
                let noScaleText: TextMetrics = this.area.measureText(noScaleValue); // TextMetrics object
                this.area.fillText(noScaleValue, -(noScaleText.width / 2), 0);
            }
            return;
        }

        // con le misure reali l'intervallo può essere enorme: il numero di barre resta fra le due costanti
        this.length = Math.round(max - min) + 1;
        if( this.length < MIN_BARS ) {
            this.length = MIN_BARS;
        }
        if( this.length > MAX_BARS ) {
            this.length = MAX_BARS;
        }
        let step: number = (max - min) / (this.length - 1);
        const last = this.data[this.data.length -1];


        this.area = this.canvas.nativeElement.getContext('2d');
        this.area.translate(this.canvas.nativeElement.width / 2, this.canvas.nativeElement.height - (10 * zoom));
        this.area.scale(zoom, zoom);
        this.area.rotate( Math.PI );
        this.area.lineWidth = (this.ray * (Math.PI / (this.length -1))) -1;
        if(this.area.lineWidth > this.ray * (Math.PI / 10)) {
            this.area.lineWidth = this.ray *(Math.PI / 10);
        }
        this.area.miterLimit = 1;
        this.area.lineCap = 'butt';

        Array( this.length )
            .fill(0)
            .forEach((n: number, i: number) => {
                if( i <= Math.round((last - min) / step) ) {
                    this.area.strokeStyle = this.activeColor;
                }
                else {
                    this.area.strokeStyle = this.placeholderColor;
                }
                this.area.beginPath();
                this.area.moveTo(this.ray, 0);
                this.area.lineTo(this.ray + this.wideRay, 0);
                this.area.stroke();
                this.area.rotate( Math.PI / (this.length -1) );
            })
        ;


        // previous -------------------------------------------------------------------------
        this.area.rotate( -this.length * (Math.PI / (this.length -1)) );
        this.area.lineWidth = (this.previousRay * (Math.PI / (this.length -1))) -1;
        if(this.area.lineWidth > this.previousRay * (Math.PI / 10)) {
            this.area.lineWidth = this.previousRay * (Math.PI / 10);
        }
        this.area.miterLimit = 1;
        this.area.lineCap = 'butt';

        Array( this.length )
            .fill(0)
            .forEach((n: number, i: number) => {
                if( i <= Math.round((this.data[ this.data.length -2 ] - min) / step) ) {
                    this.area.strokeStyle = this.previousActiveColor;
                }
                else {
                    this.area.strokeStyle = this.previousPaceholderColor;
                }
                this.area.beginPath();
                this.area.moveTo(this.previousRay, 0);
                this.area.lineTo(this.previousRay + this.previousWideRay, 0);
                this.area.stroke();
                this.area.rotate( Math.PI / (this.length -1) );
            })
        ;

        // AVG -------------------------------------------------------------------------------
        this.area.rotate( (this.length * (-Math.PI / (this.length -1))) );
        this.area.lineWidth = 1;
        this.area.miterLimit = 1;
        this.area.lineCap = 'round';
        this.area.strokeStyle = this.avgColor;
        this.area.fillStyle = this.avgColor;
        // la media si calcola a ogni disegno in una variabile locale: l'input this.avg non si riscrive
        let avg: number = this.avg;
        if( !avg ) {
            avg =
                this.data
                    .reduce((sum: number, current: number) => sum + current, 0)
                / this.data.length
            ;
        }
        this.area.beginPath();
        this.area.rotate( (Math.PI / (this.length)) * (((avg - min) / step) + 1) );
        this.area.moveTo( this.ray + this.wideRay + 5, 0 );
        this.area.lineTo(this.ray + this.wideRay + 5 + 6 , -3 );
        this.area.lineTo(this.ray + this.wideRay + 5 + 6 , 3 );
        this.area.lineTo(this.ray + this.wideRay + 5, 0 );
        this.area.stroke();
        this.area.fill();

        this.area.font = this.avgFont;
        const avgText = this.area.measureText('AVG'); // TextMetrics object
        this.area.textBaseline = "middle";
        // this.area.moveTo( this.ray + this.wideRay + 5 + 6, 0 );
        this.area.translate(this.ray + this.wideRay + 5 + 6, 0);
        this.area.rotate( Math.PI / 2 );
        this.area.fillText('AVG', -(avgText.width / 2), -5 );
        // this.area.restore();
        this.area.rotate( -1 * Math.PI / 2 );
        this.area.translate(-this.ray - this.wideRay - 5 - 6, 0);



        // TSH ------------------------------------------------------------------------------

        this.area.beginPath();
        this.area.rotate( -(Math.PI / this.length) * (((avg - min) / step) + 1) );
        this.area.rotate( (Math.PI / this.length) * (((this.ths - min) / step) + 1) );
        this.area.strokeStyle = this.thsColor;
        // la soglia si disegna solo se cade dentro la scala; le rotazioni restano perché la sezione «min» le annulla
        if( this.ths >= min && this.ths <= max ) {
            this.area.moveTo(0, 0);
            this.area.lineTo(this.ray + this.wideRay + 20, 0);
            this.area.stroke();
        }


        // min ----------------------------------------------------------------------------

        this.area.rotate( (-(Math.PI / this.length) * (((this.ths - min) / step) + 1)) + Math.PI );
        this.area.font = this.minFont;
        const minText = this.area.measureText(min + this.measureUnit); // TextMetrics object
        this.area.textBaseline = "middle";
        this.area.fillStyle = this.activeColor;
        this.area.fillText(min + this.measureUnit, -this.ray - this.wideRay - minText.width - 5, 0);


        // max ----------------------------------------------------------------------------

        // this.area.rotate( (-(Math.PI / this.length) * this.ths) + Math.PI );
        this.area.font = this.minFont;
        const maxText = this.area.measureText(max + this.measureUnit); // TextMetrics object
        this.area.textBaseline = "middle";
        this.area.fillStyle = this.activeColor;
        this.area.fillText(max + this.measureUnit, +this.ray + this.wideRay + 5, 0);

        // current ----------------------------------------------------------------------------

        this.area.font = this.mainFont;
        const currentText = this.area.measureText(last + this.measureUnit); // TextMetrics object
        let textPosition = {
            x: -(currentText.width / 2),
            y: 0
        }
        if( currentText.width >= (2 * this.ray) ) {
            // TextMetrics non ha height: senza queste due misure textPosition.y diventa NaN e il valore non si scrive
            textPosition.y = -((currentText.actualBoundingBoxAscent + currentText.actualBoundingBoxDescent) / 2);
        }
        this.area.textBaseline = "middle";
        this.area.fillStyle = this.activeColor;
        this.area.fillText(last + this.measureUnit, textPosition.x, textPosition.y);




        // trend ----------------------------------------------------------------------------


        // console.log('this.length, min, max, last, previous, avg, ths');
        // console.log(this.length, min, max, last, this.data[ this.data.length -2], this.avg, this.ths);

    }

}
