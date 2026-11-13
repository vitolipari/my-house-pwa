import {Component, Input} from '@angular/core';
import {DatePipe} from '@angular/common';
import {DeviceType} from '../../pages/devices/devices.models';
import {HistoricDataType} from '../../pages/device-details/device-details.page';
import {getLastElementOr} from '../../utils/array-util';

// consumo in W sopra il quale il motore sta girando: sotto questa soglia la tapparella è ferma
const CURTAIN_MOVING_WATT: number = 1;

// Tapparella a relè (Shelly 2PM, METERED_RELAY_CURTAIN): il movimento si legge dai consumi dei due
// motori, l'ultimo impulso dallo storico. I comandi apri e chiudi restano nella pagina
@Component({
    selector: 'curtain-detail-component',
    standalone: true,
    imports: [DatePipe],
    templateUrl: './curtain-detail.component.html',
    styleUrl: './curtain-detail.component.css'
})
export class CurtainDetailComponent {

    @Input({ required: true }) device!: DeviceType;

    // righe dello storico della pagina: per le tapparelle a relè ci sono solo gli impulsi 'true'
    @Input() history: HistoricDataType[] = [];

    protected readonly CURTAIN_MOVING_WATT = CURTAIN_MOVING_WATT;


    // impulso più recente del canale: le righe arrivano dal più recente al più vecchio, qui si
    // riordina per timestamp crescente e si prende l'ultima
    protected lastPulse(channelKey: string): HistoricDataType | null {

        let pulses: HistoricDataType[] =
            this.history
                .filter((row: HistoricDataType) => row.channel_key === channelKey)
                .filter((row: HistoricDataType) => row.value === 'true')
                .sort((x: HistoricDataType, y: HistoricDataType) => x.timestamp - y.timestamp)
        ;

        return pulses.reduce(getLastElementOr, null);
    }
}
