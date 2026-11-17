import {Component, Input, OnChanges} from '@angular/core';

@Component({
  selector: 'gauge',
  imports: [],
  templateUrl: './gauge.component.html',
  styleUrl: './gauge.component.css',
})
export class GaugeComponent implements OnChanges {


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

    // angolo della mask, come la lancetta: -180 al minimo (arco nascosto), 0 al massimo (arco scoperto)
    angoloMask: number = 0;


    // Posizione dello stop della media: average diventa l'angolo x sul semicerchio (0° a sinistra, 180° a destra);
    // il gradiente è orizzontale, quindi nel gradiente x diventa (1 - cos x) / 2.
    // L'angolo della mask si ricava qui da value, così vale già prima del primo messaggio della WebSocket
    ngOnChanges(): void {

        if( this.maximum <= this.minimum ) {
            return;
        }

        let x: number = (this.average - this.minimum) / (this.maximum - this.minimum) * 180;

        this.offsetMedia = (1 - Math.cos(x * Math.PI / 180)) / 2;

        // value arriva con l'unità ('25.88 °C'): parseFloat legge solo il numero iniziale
        this.angoloMask = -180 + (parseFloat(''+ this.value) - this.minimum) / (this.maximum - this.minimum) * 180;
    }

}
