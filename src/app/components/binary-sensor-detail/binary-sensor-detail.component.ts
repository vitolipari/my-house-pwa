import {Component, Input} from '@angular/core';
import {DatePipe} from '@angular/common';
import {DeviceType} from '../../pages/devices/devices.models';

// Ingressi digitali dello Shelly i4 (BINARY_STATE_SENSOR): una card per ogni canale input_N, in sola
// lettura; il DeviceType arriva aggiornato dalla WebSocket della pagina
@Component({
    selector: 'binary-sensor-detail-component',
    standalone: true,
    imports: [DatePipe],
    templateUrl: './binary-sensor-detail.component.html',
    styleUrl: './binary-sensor-detail.component.css'
})
export class BinarySensorDetailComponent {

    @Input({ required: true }) device!: DeviceType;
}
