import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
    selector: 'page-title',
    imports: [],
    templateUrl: './page-title.component.html',
    styleUrl: './page-title.component.css',
    standalone: true
})
export class PageTitleComponent {

    @Input() iconID: string | null = null;
    @Input() title!: string;
    @Input() hasPlusButton: boolean = true;
    // @Input() plusButtonCallBack: any;
    @Output() plusButtonClick = new EventEmitter<void>();

    plusButtonCallback() {
        this.plusButtonClick.emit();
    }
}
