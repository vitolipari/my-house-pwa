import {Component, ElementRef, HostListener, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {getLastElementOr} from '../../utils/array-util';


@Component({
    selector: 'progressive-average-chart-component',
    imports: [],
    templateUrl: './progressive-average-chart.component.html',
    standalone: true,
    styleUrl: './progressive-average-chart.component.css'
})
export class ProgressiveAverageChartComponent implements OnChanges {

    @Input() data: number[] = [];
    values: number[] = []; // normalized values
    prAvg: number[] = []; // progressive average
    @Input() ths: number = 100;
    @Input() thsVisible: boolean = false;
    @Input() thsColor: string = '#f003';

    @Input() color = '#0ff'
    @Input() thsGradient: boolean = true;

    @Input() axes: boolean = false;
    @Input() axeXColor: string = '#000';
    @Input() axeYColor: string = '#000';
    @Input() width: number | string = 300;
    @Input() height: number | string = 200;
    @ViewChild("progressiveAverageChart", {static: true, read: ElementRef}) canvas!: ElementRef<HTMLCanvasElement>;
    area: any;
    gradient: any;
    dx: number = 1;
    @Input() averageAreaColor: string = '#003';

    ngOnChanges(changes: SimpleChanges): void {

        this.area = this.canvas.nativeElement.getContext('2d');

        // width e height accettano anche misure CSS: se Number() è un numero sono pixel, ogni altra stringa passa com'è
        this.canvas.nativeElement.style.width = isNaN(Number(this.width)) ? ''+ this.width : ''+ Number(this.width) +'px';
        this.canvas.nativeElement.style.height = isNaN(Number(this.height)) ? ''+ this.height : ''+ Number(this.height) +'px';

        let data: number[] = JSON.parse(JSON.stringify(this.data));
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


        // if( this.ths < this.data[ this.data.length -1] ) {
        //     showlog('soglia superata '+ this.data[ this.data.length -1] +' > '+ this.ths );
        // }



        this.draw(min, max);
        // requestAnimationFrame(() => this.draw(min, max));
    }


    // con una misura in percentuale la larghezza reale cambia con la finestra: min e max li ricalcola ngOnChanges
    @HostListener('window:resize')
    onResize(): void {
        this.ngOnChanges({});
    }


    draw(min: number, max: number) {


        // showlog('draw', this.data);

        // i pixel del disegno si leggono dalla misura reale dello stile: riassegnare width a un canvas già disegnato lo svuota
        this.canvas.nativeElement.width = this.canvas.nativeElement.clientWidth;
        this.canvas.nativeElement.height = this.canvas.nativeElement.clientHeight;

        this.prAvg = [];

        // senza scala (un solo valore o valori tutti uguali) non si disegna: (max - min) varrebbe 0
        if( this.data.length < 2 || max === min ) {
            return;
        }

        // la soglia resta fra min e max: l'input this.ths non si riscrive
        let ths: number = this.ths;
        if( ths < min ) ths = min;
        if( ths > max ) ths = max;

        this.area.translate(0, this.canvas.nativeElement.height);
        this.area.rotate(-Math.PI);
        this.area.scale(-1, 1);

        this.area.lineWidth = 2;
        this.area.miterLimit = 1;
        this.area.lineCap = 'round';

        this.gradient = this.area.createLinearGradient(0, 0, 0, this.canvas.nativeElement.height);
        this.gradient.addColorStop(0.1, "green");
        this.gradient.addColorStop(((ths - min) / (max - min)) , "yellow"); // soglia
        // showlog('trend gradient soglia ', ((this.ths - min) / (max - min) ) );
        this.gradient.addColorStop(0.9, "red");




        this.values =

            JSON.parse(JSON.stringify(this.data))

                // messa a terra
                .map((val: number) => val - min)

                // normalizzazione
                .map((val: number) => val / (max - min))

                // adattamento
                .map((val: number) => val * this.canvas.nativeElement.height)

                // trim
                .filter((val: number, index: number) => (this.data.length - index) < 100)

        ;

        let maxLen: number = (this.values.length > 100) ? 100 : this.values.length;
        this.dx = this.canvas.nativeElement.width / maxLen;
        if( this.dx > 20 ) this.dx = 20;

        let thsNormalized = (ths - min) / (max - min) * this.canvas.nativeElement.height;
        // if( thsNormalized < this.values[ this.values.length -1] ) {
        //     showlog('soglia normalizzata superata '+ this.values[ this.values.length -1] +' > '+ thsNormalized );
        // }


        // AXES
        if( !!this.axes ) {
            this.area.beginPath();
            this.area.strokeStyle = this.axeXColor;
            this.area.fillStyle = this.axeXColor;
            this.area.moveTo(0, 0);
            this.area.lineTo(this.canvas.nativeElement.width, 0);
            this.area.lineTo(this.canvas.nativeElement.width -5, -5);
            this.area.lineTo(this.canvas.nativeElement.width -5, 5);
            this.area.lineTo(this.canvas.nativeElement.width, 0);
            this.area.fill();
            this.area.stroke();
            this.area.strokeStyle = this.axeYColor;
            this.area.fillStyle = this.axeYColor;
            this.area.beginPath();
            this.area.moveTo(0, 0);
            this.area.lineTo(0, this.canvas.nativeElement.height);
            this.area.lineTo(-5, this.canvas.nativeElement.height -5);
            this.area.lineTo(5, this.canvas.nativeElement.height -5);
            this.area.lineTo(0, this.canvas.nativeElement.height);
            this.area.fill();
            this.area.stroke();
            this.area.strokeStyle = '#000';
        }


        // THS
        if( !!this.thsVisible ) {
            this.area.beginPath();
            this.area.strokeStyle = this.thsColor;
            this.area.moveTo(0, thsNormalized);
            this.area.lineTo(this.canvas.nativeElement.width, thsNormalized);
            this.area.stroke();
        }

        // Progressive Average
        this.values
            .forEach((val: number, index: number) => {

                // progressive average
                this.prAvg.push(
                    this.values
                        .filter((val: number, i: number) => i <= index)
                        .reduce((sum: number, current: number) => (sum + current), 0)
                    / (index + 1)
                );
            })
        ;


        // Trend
        this.area.beginPath();

        this.area.strokeStyle = this.color;
        if( !!this.thsGradient ) {
            this.area.strokeStyle = this.gradient;
        }

        this.area.moveTo(0, this.values[0]);
        let lastPoint: any = {x: 0, y: this.values[0]};
        this.values
            .forEach((val: number, index: number) => {
                this.area.moveTo(lastPoint.x, lastPoint.y);
                let mdpv: number = ( val + this.values[ index +1 ] ) / 2;
                lastPoint = {x: (index * this.dx) + (this.dx / 2), y: mdpv};
                this.area.quadraticCurveTo(
                    index * this.dx, val,
                    lastPoint.x, lastPoint.y
                );
            })
        ;
        this.area.stroke();
        this.area.closePath();

        // Average
        this.area.beginPath();
        this.area.lineWidth = 1;
        this.area.moveTo(0, this.values[0]);
        lastPoint = {x: 0, y: this.values[0]};
        this.area.moveTo(lastPoint.x, lastPoint.y)
        this.values
            .forEach((val: number, index: number) => {
                let mdpv: number = ( val + this.values[ index +1 ] ) / 2;
                lastPoint = {x: (index * this.dx) + (this.dx / 2), y: mdpv};
                this.area.quadraticCurveTo(
                    index * this.dx, val,
                    lastPoint.x, lastPoint.y
                );
            })
        ;

        // this.values
        this.prAvg
            .forEach((val: number, index: number) => {
                let revIndex = this.prAvg.length - 1 - index;
                let mdpv: number = ( this.prAvg[ revIndex ] + this.prAvg[ revIndex -1 ] ) / 2;
                lastPoint = {x: (revIndex * this.dx) - (this.dx / 2), y: mdpv};
                this.area.quadraticCurveTo(
                    revIndex * this.dx, this.prAvg[ revIndex ],
                    lastPoint.x, lastPoint.y
                );
            })
        ;

        let revIndex = 0;
        let mdpv: number = ( this.prAvg[ revIndex ] + this.prAvg[ revIndex -1 ] ) / 2;
        this.area.quadraticCurveTo(
            0, this.prAvg[ 0 ],
            0, this.prAvg[0]
        );
        this.area.strokeStyle = '#F0F';
        this.area.closePath();
        this.area.fillStyle = this.averageAreaColor;
        this.area.fill();

        // requestAnimationFrame(() => this.draw(min, max));

    }

}
