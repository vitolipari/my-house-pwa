import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-avoid',
  imports: [],
  templateUrl: './avoid.html',
  styleUrl: './avoid.scss',
  standalone: true
})
export class Avoid {

  @Input() disabled: boolean = false;
  @Input() disabledColor: string = '#ddd';
  @Input() activeColor: string = '#ec1754';

  spessore: number = 2.5;

}
