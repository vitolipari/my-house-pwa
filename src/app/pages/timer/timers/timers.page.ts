import {Component, inject} from '@angular/core';
import {PageTitleComponent} from '../../../components/page-title.component/page-title.component';
import {Router} from '@angular/router';

@Component({
  selector: 'app-timers.page',
    imports: [
        PageTitleComponent
    ],
  templateUrl: './timers.page.html',
  styleUrl: './timers.page.css',
})
export class TimersPage {

    private readonly router = inject(Router);

    protected addNewTimer() {
        this.router.navigate(
            ['/new-timer'],
            {
                state: {
                    from: 'timersPage'
                }
            }
        );
    }
}
