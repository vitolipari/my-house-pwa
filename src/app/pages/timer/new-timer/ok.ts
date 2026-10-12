import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-ok',
  imports: [],
  templateUrl: './ok.html',
  styleUrl: './ok.scss',
  standalone: true
})
export class Ok {

  @Input() disabled: boolean = false;
  @Input() disabledColor: string = '#ddd';
  @Input() activeColor: string = '#00C752';

}
