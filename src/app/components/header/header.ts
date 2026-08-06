import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {LoggedUser} from '../../models/auth.models';
import {JsonPipe} from '@angular/common';
import {Router} from '@angular/router';

@Component({
    selector: 'app-header',
    imports: [
        JsonPipe
    ],
    templateUrl: './header.html',
    styleUrl: './header.css',
    standalone: true
})
export class Header {

    @Input() user!: LoggedUser | null;
    @Input() isInProfilePage: boolean = false;
    @Output() menuToggle = new EventEmitter<boolean>();

    private router = inject(Router);
    @Output() menuClose = new EventEmitter<boolean>();


    gotoProfilePage() {
        this.router.navigate(['/profile/page']);
    }

    gotoPreviousPage() {

    }

    goBack() {
        window.history.back();
    }

    openMobileMenu() {
        this.menuToggle.emit( true );
    }
}
