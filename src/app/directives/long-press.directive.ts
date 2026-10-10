import {Directive, ElementRef, EventEmitter, HostListener, inject, Input, OnDestroy, Output} from '@angular/core';

/**
 * Pressione prolungata su un'immagine: emette `longPress` dopo `longPressDuration` ms
 * e vibra (Android con Vibration API, iOS con il feedback aptico dello switch di Safari).
 * Il click che segue il rilascio viene bloccato, così il contenitore non lo riceve.
 */
@Directive({
    selector: 'img[longPress]',
    standalone: true
})
export class LongPressDirective implements OnDestroy {

    // inputs
    @Input() longPressDuration: number = 500;   // ms
    @Input() longPressTolerance: number = 10;   // px di movimento oltre i quali la pressione si annulla (scroll)
    @Input() longPressVibration: number = 30;   // ms di vibrazione su Android, 0 = nessuna vibrazione

    // outputs
    @Output() longPress = new EventEmitter<PointerEvent>();

    // variables
    private timer: ReturnType<typeof setTimeout> | null = null;
    private startX: number = 0;
    private startY: number = 0;
    private fired: boolean = false;

    // services
    private readonly host = inject(ElementRef<HTMLImageElement>);

    constructor() {
        const img: HTMLImageElement = this.host.nativeElement;
        // niente menu "Salva immagine", selezione o trascinamento nativi durante la pressione
        img.draggable = false;
        img.style.setProperty('-webkit-touch-callout', 'none');
        img.style.setProperty('-webkit-user-drag', 'none');
        img.style.setProperty('user-select', 'none');
        img.style.setProperty('-webkit-user-select', 'none');
    }

    @HostListener('pointerdown', ['$event'])
    onPointerDown(event: PointerEvent) {
        if (event.pointerType === 'mouse' && event.button !== 0) {
            return;
        }
        this.clearTimer();
        this.fired = false;
        this.startX = event.clientX;
        this.startY = event.clientY;
        this.timer = setTimeout(() => {
            this.timer = null;
            this.fired = true;
            this.vibrate();
            this.longPress.emit(event);
        }, this.longPressDuration);
    }

    @HostListener('pointermove', ['$event'])
    onPointerMove(event: PointerEvent) {
        if (this.timer
            && (Math.abs(event.clientX - this.startX) > this.longPressTolerance
                || Math.abs(event.clientY - this.startY) > this.longPressTolerance)) {
            this.clearTimer();
        }
    }

    @HostListener('pointerup')
    @HostListener('pointerleave')
    @HostListener('pointercancel')
    onPointerEnd() {
        this.clearTimer();
    }

    // Dopo un long press il click del rilascio non deve arrivare al contenitore (es. navigazione)
    @HostListener('click', ['$event'])
    onClick(event: MouseEvent) {
        if (this.fired) {
            event.preventDefault();
            event.stopPropagation();
            this.fired = false;
        }
    }

    // Su Android e desktop la pressione prolungata apre il menu contestuale
    @HostListener('contextmenu', ['$event'])
    onContextMenu(event: Event) {
        event.preventDefault();
    }

    ngOnDestroy(): void {
        this.clearTimer();
    }

    private clearTimer() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    // Android: Vibration API. iOS non la supporta: da Safari 17.4 il cambio di stato
    // di un <input type="checkbox" switch> produce un feedback aptico, lo si simula con un label nascosto.
    private vibrate() {
        if (!this.longPressVibration) {
            return;
        }
        if (typeof navigator.vibrate === 'function') {
            navigator.vibrate(this.longPressVibration);
            return;
        }
        try {
            const label: HTMLLabelElement = document.createElement('label');
            const input: HTMLInputElement = document.createElement('input');
            input.type = 'checkbox';
            input.setAttribute('switch', '');
            label.appendChild(input);
            label.style.display = 'none';
            document.body.appendChild(label);
            label.click();
            document.body.removeChild(label);
        }
        catch (e: any) {
            console.log('errore in LongPressDirective.vibrate: feedback aptico iOS');
            console.log(e);
        }
    }
}
