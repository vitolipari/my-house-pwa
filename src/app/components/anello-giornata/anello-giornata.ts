import {Component, Input, OnChanges} from '@angular/core';

interface Punto {
    x: number;
    y: number;
}


@Component({
  selector: 'app-anello-giornata',
  imports: [],
  templateUrl: './anello-giornata.html',
  styleUrl: './anello-giornata.css',
})
export class AnelloGiornata implements OnChanges {


    // ore decimali: 6.5 = 06:30
    @Input() alba: number = 6.5;
    @Input() tramonto: number = 19.5;
    @Input() spessore: number = 20;


    // mezza durata delle transizioni, in ore
    private readonly mezzaAlba: number = 0.5;
    private readonly mezzoTramonto: number = 1;

    @Input()  cx: number = 50;
    @Input()  cy: number = 50;
    @Input()  r: number = 35;
    @Input()  isNeon: boolean = true
    @Input()  id: string = '';

    arcoNotte: string = '';
    arcoAlba: string = '';
    arcoGiorno: string = '';
    arcoTramonto: string = '';

    inizioAlba: Punto = { x: 0, y: 0 };
    fineAlba: Punto = { x: 0, y: 0 };
    inizioTramonto: Punto = { x: 0, y: 0 };
    fineTramonto: Punto = { x: 0, y: 0 };

    ngOnChanges(): void {
        this.calcolaArchi();
    }

    // Ricalcola i 4 archi e gli estremi dei gradienti dagli orari di alba e tramonto
    private calcolaArchi = (): void => {
        const oraInizioAlba = this.alba - this.mezzaAlba;
        const oraFineAlba = this.alba + this.mezzaAlba;
        const oraInizioTramonto = this.tramonto - this.mezzoTramonto;
        const oraFineTramonto = this.tramonto + this.mezzoTramonto;

        this.arcoNotte = this.arcoOre(oraFineTramonto, oraInizioAlba);
        this.arcoAlba = this.arcoOre(oraInizioAlba, oraFineAlba);
        this.arcoGiorno = this.arcoOre(oraFineAlba, oraInizioTramonto);
        this.arcoTramonto = this.arcoOre(oraInizioTramonto, oraFineTramonto);

        this.inizioAlba = this.puntoOra(oraInizioAlba);
        this.fineAlba = this.puntoOra(oraFineAlba);
        this.inizioTramonto = this.puntoOra(oraInizioTramonto);
        this.fineTramonto = this.puntoOra(oraFineTramonto);
    };

    // Converte un'ora del giorno nel punto sull'anello: mezzanotte in alto, verso antiorario
    private puntoOra = (ora: number): Punto => {
        const angolo = ora * 15 * Math.PI / 180;
        // return { x: this.cx - this.r * Math.sin(angolo), y: this.cy - this.r * Math.cos(angolo) };
        // rotazione oraria
        return { x: this.cx + this.r * Math.sin(angolo), y: this.cy - this.r * Math.cos(angolo) };
    };

    // Path SVG dell'arco fra due ore, anche a cavallo della mezzanotte
    private arcoOre = (da: number, a: number): string => {
        const p1 = this.puntoOra(da);
        const p2 = this.puntoOra(a);
        const ampiezza = ((a - da + 24) % 24) * 15;
        const grande = ampiezza > 180 ? 1 : 0;
        // return `M ${p1.x} ${p1.y} A ${this.r} ${this.r} 0 ${grande} 0 ${p2.x} ${p2.y}`;
        // rotazione oraria
        return `M ${p1.x} ${p1.y} A ${this.r} ${this.r} 0 ${grande} 1 ${p2.x} ${p2.y}`;
    };

}
