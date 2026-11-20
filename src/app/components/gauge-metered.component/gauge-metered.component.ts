import {Component, Input, OnChanges} from '@angular/core';

@Component({
  selector: 'gauge-metered',
  imports: [],
  templateUrl: './gauge-metered.component.html',
  styleUrl: './gauge-metered.component.css',
})
export class GaugeMeteredComponent implements OnChanges {


    @Input() minimum: number = 0;
    @Input() maximum: number = 0;
    @Input() average: number = (this.maximum - this.minimum) / 2;
    @Input() angolo: number = 0;
    @Input() value: number | string = '';
    @Input() hasColorMagnitude: boolean = false;
    @Input() colori: string[] = ['#00cc66', '#ffff00', '#ff0000'];

    // id diverso per ogni gauge: nella pagina ce n'è più di uno (power_0, power_1)
    idGradiente: string = 'gauge-'+ Math.random().toString(36).slice(2, 8);

    offsetMedia: number = 0.5;
    zero: string = '';


    // Posizione dello stop della media: average diventa l'angolo x sul semicerchio (0° a sinistra, 180° a destra);
    // il gradiente è orizzontale, quindi nel gradiente x diventa (1 - cos x) / 2
    ngOnChanges(): void {

        if( this.maximum <= this.minimum ) {
            return;
        }

        let x: number = (this.average - this.minimum) / (this.maximum - this.minimum) * 180;

        this.offsetMedia = (1 - Math.cos(x * Math.PI / 180)) / 2;

        // calcolo dello zero
        // centro e raggio del semicerchio in unità del viewBox: gli stessi del <circle> del template
        let circle: { x: number, y: number, r: number } = { x: 50, y: 100, r: 90 };
        // arco dello zero: solo quando lo zero cade dentro la scala
        this.zero = '';
        if( this.minimum < 0 && this.maximum > 0 ) {

            let angoloZero: number = (0 - this.minimum) / (this.maximum - this.minimum) * 180 - 180;
            let x1: number = circle.x + circle.r * Math.cos((angoloZero - 1) * Math.PI / 180);
            let y1: number = circle.y + circle.r * Math.sin((angoloZero - 1) * Math.PI / 180);
            let x2: number = circle.x + circle.r * Math.cos((angoloZero + 1) * Math.PI / 180);
            let y2: number = circle.y + circle.r * Math.sin((angoloZero + 1) * Math.PI / 180);

            this.zero = `M ${x1} ${y1} A ${circle.r} ${circle.r} 0 0 1 ${x2} ${y2}`;
        }

    }

}
