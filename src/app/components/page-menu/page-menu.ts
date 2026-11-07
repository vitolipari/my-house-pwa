import {Component, EventEmitter, Output, TemplateRef, ViewChild} from '@angular/core';

@Component({
  selector: 'page-menu',
  imports: [],
  templateUrl: './page-menu.html',
  styleUrl: './page-menu.css',
})
export class PageMenu {

    @ViewChild('itemMenu', { static: true }) template!: TemplateRef<any>;

    @Output() editClick = new EventEmitter<void>();
    @Output() duplicateClick = new EventEmitter<void>();
    @Output() deleteClick = new EventEmitter<void>();

    protected editData() {
        this.editClick.emit();
    }

    protected duplicate() {
        this.duplicateClick.emit();
    }

    protected deleteItem() {
        this.deleteClick.emit();
    }
}
