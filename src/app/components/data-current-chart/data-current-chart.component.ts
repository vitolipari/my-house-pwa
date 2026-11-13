import {Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {getLastElementOr} from '../../utils/array-util';


// canvas per cui il disegno è pensato (le misure originali di historicChartOptions): il disegno cresce con zoom
const BASE_WIDTH = 250;
const BASE_HEIGHT = 100;


@Component({
    selector: 'data-current-chart',
    imports: [],
    templateUrl: './data-current-chart.component.html',
    standalone: true,
    styleUrl: './data-current-chart.component.css'
})
export class DataCurrentChartComponent implements OnInit, OnChanges, OnDestroy {

    @Input() data: number[] = [];
    @ViewChild("dataCurrentChart", {static: true, read: ElementRef}) canvas!: ElementRef<HTMLCanvasElement>;
    area: any;
    @Input() ray: number = 50;
    @Input() wideRay: number = 25;
    min: number = 0;
    max: number = 0;
    length: number = 0;
    @Input() activeColor: string = '#35ff';
    @Input() antiActiveColor: string = 'red';
    @Input() mainFont: string = '14px Orbitron';
    @Input() measureUnit: string = '';

    indexLenght: number = this.ray + this.wideRay - 5;
    indexWide: number = 14;
    rotationAnimationStep: number = 0.1;
    i: number = 0;
    rotateTo: number = Math.PI;
    // identificativo del fotogramma prenotato: serve a fermare il ciclo in ngOnDestroy
    frame: number = 0;


    gradient: any;
    @Input() width: number | string = 250;
    @Input() height: number | string = 200;
    @Input() ths: number = 100;




    ngOnInit(): void {

        this.area = this.canvas.nativeElement.getContext('2d');

        this.frame = requestAnimationFrame(() => this.draw());
    }


    ngOnChanges(changes: SimpleChanges): void {

        // width e height accettano anche misure CSS: se Number() è un numero sono pixel, ogni altra stringa passa com'è
        this.canvas.nativeElement.style.width = isNaN(Number(this.width)) ? ''+ this.width : ''+ Number(this.width) +'px';
        this.canvas.nativeElement.style.height = isNaN(Number(this.height)) ? ''+ this.height : ''+ Number(this.height) +'px';
    }


    // il ciclo di requestAnimationFrame non si ferma da solo: lo annulla l'uscita dalla pagina
    ngOnDestroy(): void {
        cancelAnimationFrame(this.frame);
    }


    draw() {

        // il fotogramma successivo si prenota all'inizio: il ciclo continua anche quando manca la scala
        this.frame = requestAnimationFrame(() => this.draw());

        let currentRotation: number = 0

        // i pixel del disegno vengono dallo stile: l'altezza si assegna solo se cambia, così il canvas si azzera una volta per fotogramma e non due
        if( this.canvas.nativeElement.height !== this.canvas.nativeElement.clientHeight ) {
            this.canvas.nativeElement.height = this.canvas.nativeElement.clientHeight;
        }
        this.canvas.nativeElement.width = this.canvas.nativeElement.clientWidth;

        // il disegno cresce con il canvas: si tiene il fattore più piccolo, così non esce né in larghezza né in altezza
        let zoom: number = this.canvas.nativeElement.width / BASE_WIDTH;
        if( zoom > this.canvas.nativeElement.height / BASE_HEIGHT ) {
            zoom = this.canvas.nativeElement.height / BASE_HEIGHT;
        }

        this.area.translate(this.canvas.nativeElement.width / 2, this.canvas.nativeElement.height - (20 * zoom));
        this.area.scale(zoom, zoom);
        this.area.lineWidth = (this.wideRay);
        this.area.miterLimit = 1;
        this.area.lineCap = 'butt';



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
        // senza scala (un solo valore o valori tutti uguali) niente lancetta: si scrive almeno il valore attuale
        if( this.data.length < 2 || max === min ) {
            // con una serie vuota non si scrive nulla; il contesto è già a metà larghezza, vicino al bordo basso, e scalato con zoom
            if( this.data.length > 0 ) {
                let noScaleValue: string = this.data[this.data.length -1] + this.measureUnit;
                this.area.font = this.mainFont;
                this.area.textBaseline = "middle";
                this.area.fillStyle = this.activeColor;
                this.area.shadowColor = this.antiActiveColor;
                this.area.shadowOffsetX = 0;
                this.area.shadowOffsetY = 0;
                this.area.shadowBlur = 5 * zoom;
                let noScaleText: TextMetrics = this.area.measureText(noScaleValue); // TextMetrics object
                this.area.fillText(noScaleValue, -(noScaleText.width / 2), 0);
            }
            return;
        }

        this.length = max - min +1;
        const last = this.data[this.data.length -1];

        // la soglia resta fra min e max: l'input this.ths non si riscrive
        let ths: number = this.ths;
        if( ths < min ) ths = min;
        if( ths > max ) ths = max;

        this.gradient = this.area.createConicGradient(Math.PI, 0, 0);
        this.gradient.addColorStop(0.09, "green");
        this.gradient.addColorStop(0.1 + (0.4 * ((ths - min) / (max - min) )) , "yellow"); // soglia
        // showlog('live gradient soglia ', ((this.ths - min) / (max - min) ) );
        this.gradient.addColorStop(0.51, "red");
        this.gradient.addColorStop(1, "green");
        this.area.strokeStyle = this.gradient;


        // TODO da attenzionare forse va commentato
        // Array( this.length )
        //     .fill(0)
        //     .forEach((n: number, i: number) => {
        //         this.area.beginPath();
        //         this.area.moveTo(this.ray, 0);
        //         this.area.arc(0, 0, this.ray, 0, -Math.PI, true);
        //         this.area.stroke();
        //     })
        // ;

        this.area.beginPath();
        this.area.moveTo(this.ray, 0);
        this.area.arc(0, 0, this.ray, 0, -Math.PI, true);
        this.area.stroke();


        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        let newRotateTo: number = (( this.data[ this.data.length -1 ] -min) * (Math.PI / (this.length -1)));

        if( this.data[ this.data.length -1 ] > this.data[ this.data.length -2 ]) {
            this.rotateTo = newRotateTo;
            if( this.i < this.rotateTo ) {
                this.i += this.rotationAnimationStep;
            }
        }
        else {
            this.rotateTo = newRotateTo;
            if( this.i > this.rotateTo ) {
                this.i -= this.rotationAnimationStep;
            }
        }
        this.area.rotate( Math.PI + this.i );
        currentRotation += Math.PI + this.i;

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


        this.area.fillStyle = this.activeColor;
        this.area.lineCap = 'round';
        this.area.beginPath();
        this.area.moveTo(this.indexLenght, 0);
        this.area.lineTo(0, this.indexWide / 2);
        this.area.arc(0, 0, this.indexWide / 2, Math.PI / 2, 3 * Math.PI / 2, false);
        // this.area.moveTo(0, 50);
        this.area.lineTo(this.indexLenght, 0);
        this.area.fill();


        // this.area.rotate(-this.rotateTo + Math.PI);
        this.area.rotate(-currentRotation);
        // this.area.rotate(-((this.data[ this.data.length -1 ] / this.max) * (Math.PI / (this.length))));
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

        this.area.shadowColor = this.antiActiveColor; // string

        // Horizontal distance of the shadow, in relation to the text.
        this.area.shadowOffsetX = 0; // integer

        // Vertical distance of the shadow, in relation to the text.
        this.area.shadowOffsetY = 0; // integer

        // Blurring effect to the shadow, the larger the value, the greater the blur.
        this.area.shadowBlur = 5 * zoom; // integer

        this.area.fillText(last + this.measureUnit, textPosition.x, textPosition.y);


        this.area.rotate(this.rotateTo);

    }


}
