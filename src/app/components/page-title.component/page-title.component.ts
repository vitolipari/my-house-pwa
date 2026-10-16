import {Component, EventEmitter, Input, Output, TemplateRef} from '@angular/core';
import {Menu} from 'primeng/menu';
import {Button, ButtonModule} from 'primeng/button';
import { Popover, PopoverModule } from 'primeng/popover';
import {NgTemplateOutlet} from '@angular/common';

@Component({
    selector: 'page-title',
    imports: [
        Menu,
        Button,
        ButtonModule,
        PopoverModule,
        NgTemplateOutlet
    ],
    templateUrl: './page-title.component.html',
    styleUrl: './page-title.component.css',
    standalone: true
})
export class PageTitleComponent {

    @Input() iconID: string | null = null;
    @Input() title!: string;
    @Input() hasPlusButton: boolean = true;
    @Input() hasEditButton: boolean = false;
    @Input() hasMenuButton: boolean = false;
    @Input() menu: TemplateRef<any> | null = null;

    // @Input() plusButtonCallBack: any;
    @Output() plusButtonClick = new EventEmitter<void>();
    @Output() editButtonClick = new EventEmitter<void>();
    @Output() menuButtonClick = new EventEmitter<void>();

    plusButtonCallback() {
        this.plusButtonClick.emit();
    }

    editButtonCallback() {
        this.editButtonClick.emit();
    }

    menuButtonCallback() {
        this.menuButtonClick.emit();
    }

}
