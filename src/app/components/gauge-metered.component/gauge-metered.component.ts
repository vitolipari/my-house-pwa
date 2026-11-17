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


    // Posizione dello stop della media: average diventa l'angolo x sul semicerchio (0° a sinistra, 180° a destra);
    // il gradiente è orizzontale, quindi nel gradiente x diventa (1 - cos x) / 2
    ngOnChanges(): void {

        if( this.maximum <= this.minimum ) {
            return;
        }

        let x: number = (this.average - this.minimum) / (this.maximum - this.minimum) * 180;

        this.offsetMedia = (1 - Math.cos(x * Math.PI / 180)) / 2;
    }

}
