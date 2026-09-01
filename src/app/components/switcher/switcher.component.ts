import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
    selector: 'switcher-component',
    imports: [],
    templateUrl: './switcher.component.html',
    standalone: true,
    styleUrl: './switcher.component.css'
})
export class SwitcherComponent {

    @Input() isReadOnly: boolean;
    @Input() check: boolean;
    @Input() inWait: boolean = false;
    @Input() inError: boolean = false;
    @Output() toggle = new EventEmitter<boolean>();

    constructor() {
        this.isReadOnly = false;
        this.check = false;
    }

    onCheck = (event: MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();

        if (!this.isReadOnly) {
            this.check = !this.check;
            this.toggle.emit( this.check );
        }

    }
}
