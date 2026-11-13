import {Component, inject, Input, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {firstValueFrom} from 'rxjs';
import {Button} from 'primeng/button';
import {Select} from 'primeng/select';
import {DeviceType} from '../../pages/devices/devices.models';
import {DeviceApiService} from '../../pages/devices/device-api';


// valori del modello Tuya del climatizzatore (Toyotomi, letto il 13/11): la PWA manda SET:<valore>, il Core li controlla
const MODE_OPTIONS: {value: string, label: string}[] = [
    {value: 'cold', label: 'freddo'},
    {value: 'hot', label: 'caldo'},
    {value: 'wet', label: 'deumidifica'},
    {value: 'wind', label: 'ventilazione'},
    {value: 'auto', label: 'automatico'}
];

const FAN_OPTIONS: {value: string, label: string}[] = [
    {value: 'auto', label: 'automatica'},
    {value: 'mute', label: 'silenziosa'},
    {value: 'low', label: 'bassa'},
    {value: 'mid_low', label: 'medio-bassa'},
    {value: 'mid', label: 'media'},
    {value: 'mid_high', label: 'medio-alta'},
    {value: 'high', label: 'alta'},
    {value: 'strong', label: 'turbo'}
];

// alette: il modello Tuya usa stringhe numeriche, l'etichetta è il valore stesso
const VERTICAL_SWING_OPTIONS: {value: string, label: string}[] = [
    {value: '0', label: '0'},
    {value: '1', label: '1'},
    {value: '2', label: '2'},
    {value: '3', label: '3'}
];

const HORIZONTAL_SWING_OPTIONS: {value: string, label: string}[] = [
    {value: '0', label: '0'},
    {value: '1', label: '1'},
    {value: '2', label: '2'},
    {value: '3', label: '3'},
    {value: '4', label: '4'},
    {value: '5', label: '5'},
    {value: '6', label: '6'},
    {value: '7', label: '7'}
];

const VERTICAL_POSITION_OPTIONS: {value: string, label: string}[] = [
    {value: '0', label: '0'},
    {value: '1', label: '1'},
    {value: '2', label: '2'},
    {value: '3', label: '3'},
    {value: '4', label: '4'},
    {value: '5', label: '5'}
];

const HORIZONTAL_POSITION_OPTIONS: {value: string, label: string}[] = [
    {value: '0', label: '0'},
    {value: '1', label: '1'},
    {value: '2', label: '2'},
    {value: '3', label: '3'},
    {value: '4', label: '4'},
    {value: '5', label: '5'},
    {value: '6', label: '6'},
    {value: '7', label: '7'},
    {value: '8', label: '8'}
];

// limiti di temp_set nel modello del climatizzatore
const TARGET_TEMPERATURE_MIN: number = 16;
const TARGET_TEMPERATURE_MAX: number = 31;


// dettaglio dedicato del climatizzatore: temperatura, modo, ventola e alette.
// L'accensione resta alla pagina e lo stato aggiornato arriva dalla sua WebSocket
@Component({
    selector: 'climate-detail-component',
    standalone: true,
    imports: [FormsModule, Button, Select],
    templateUrl: './climate-detail.component.html',
    styleUrl: './climate-detail.component.css'
})
export class ClimateDetailComponent {

    @Input({ required: true }) device!: DeviceType;

    private readonly deviceApi = inject(DeviceApiService);

    protected readonly inWaiting = signal<boolean>(false);
    protected readonly errorMessage = signal<string>('');

    // il template legge solo i membri del componente: le costanti di modulo si riespongono qui, come CHART_TYPES
    protected readonly MODE_OPTIONS = MODE_OPTIONS;
    protected readonly FAN_OPTIONS = FAN_OPTIONS;
    protected readonly VERTICAL_SWING_OPTIONS = VERTICAL_SWING_OPTIONS;
    protected readonly HORIZONTAL_SWING_OPTIONS = HORIZONTAL_SWING_OPTIONS;
    protected readonly VERTICAL_POSITION_OPTIONS = VERTICAL_POSITION_OPTIONS;
    protected readonly HORIZONTAL_POSITION_OPTIONS = HORIZONTAL_POSITION_OPTIONS;
    protected readonly TARGET_TEMPERATURE_MIN = TARGET_TEMPERATURE_MIN;
    protected readonly TARGET_TEMPERATURE_MAX = TARGET_TEMPERATURE_MAX;


    // unico metodo dei comandi: SET:<valore> sul canale; il componente non aggiorna status da solo
    protected setValue(channelKey: string, value: string | number): void {

        this.inWaiting.set(true);
        this.errorMessage.set('');

        firstValueFrom(this.deviceApi.deviceAction(this.device.id, channelKey, 'SET:'+ value))
            .then(() => {
                this.inWaiting.set(false);
            })
            .catch((e: any) => {
                console.log('errore in setValue di ClimateDetailComponent: impostazione del climatizzatore');
                console.log(e);
                this.inWaiting.set(false);
                // il Core dei dispositivi risponde {error: '<messaggio>'}
                this.errorMessage.set(e?.error || 'comando non riuscito');
            })
        ;
    }
}
