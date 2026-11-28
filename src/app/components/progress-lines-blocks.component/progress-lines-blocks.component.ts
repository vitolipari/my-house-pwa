import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'progress-lines-blocks',
  imports: [],
  templateUrl: './progress-lines-blocks.component.html',
  styleUrl: './progress-lines-blocks.component.css',
})
export class ProgressLinesBlocksComponent implements OnInit {

    @Input() n: number = 100;
    @Input() segments: any[] = [];
    @Input() colors: string[] = ['#e3b509', '#aaa'];
    @Input({required: false}) currentLabel: string = "";

    @Output() valueChange: EventEmitter<number> = new EventEmitter<number>();

    spazio: number = 4;         // px vuoti fra una tacca e l'altra, al massimo
    spazioMinimo: number = 1;   // px vuoti fra le tacche quando sono fitte
    spessore: string = '';      // stroke-width delle tacche, da ngOnInit
    value: number = 0;          // tacche colorate, da 0 a n
    premuto: boolean = false;

    // la pressione colora subito fino al dito e cattura il puntatore: lo strofinio continua anche fuori dal componente
    onPointerDown(e: PointerEvent) {
        this.premuto = true;
        (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
        this.onPointerMove(e);
    }

    // colora le tacche con il centro a sinistra del dito o del mouse
    onPointerMove(e: PointerEvent) {



        if( !this.premuto ) {
            return;
        }

        let box: DOMRect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
        let x: number = e.clientX - box.left;
        let tacche: number = Math.round(x * this.n / box.width);     // ogni tacca occupa box.width / n px


        if( tacche < 0 ) {
            tacche = 0;
        }
        if( tacche > this.n ) {
            tacche = this.n;
        }

        if( tacche !== this.value ) {
            this.value = tacche;

            if( !this.currentLabel || (this.currentLabel === '') ) {
                this.currentLabel = ''+ (this.value);
            }

            this.valueChange.emit(this.value);
        }

    }



    ngOnInit(): void {

        this.segments =
            new Array(this.n)
                .fill({})
                .map((segment: any, index: number) => ({
                    value: index,
                }))
        ;

        // spessore = spazio di ogni tacca (100 / n cqw) meno quello vuoto: al massimo `spazio` px,
        // con tacche fitte metà dello spazio di una tacca, mai meno di `spazioMinimo` px
        this.spessore = 'calc('+ (100 / this.n) +'cqw - clamp('+ this.spazioMinimo +'px, '+ (50 / this.n) +'cqw, '+ this.spazio +'px))';


    }

}
