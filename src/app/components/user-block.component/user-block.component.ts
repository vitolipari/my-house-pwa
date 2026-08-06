import {Component, Input} from '@angular/core';

@Component({
    selector: 'user-block',
    imports: [],
    templateUrl: './user-block.component.html',
    styleUrl: './user-block.component.css',
    standalone: true
})
export class UserBlockComponent {

    @Input() user: any;

}
