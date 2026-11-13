import {Component, Input} from '@angular/core';

@Component({
    selector: 'powerd-by-component',
    imports: [],
    templateUrl: './powerd-by.component.html',
    standalone: true,
    styleUrl: './powerd-by.component.css'
})
export class PowerdByComponent {

    @Input() isDarkTheme!: boolean;

}
