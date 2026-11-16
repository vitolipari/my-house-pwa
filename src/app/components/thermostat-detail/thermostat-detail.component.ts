import {Component, inject, Input, signal} from '@angular/core';
import {firstValueFrom} from 'rxjs';
import {Button} from 'primeng/button';
import {DeviceType} from '../../pages/devices/devices.models';
import {DeviceApiService} from '../../pages/devices/device-api';


// valori del modello Tuya del termostato (categoria wk, letto il 15/11): la PWA manda SET:<valore>, il Core li controlla
const MODE_OPTIONS: {value: string, label: string}[] = [
    {value: 'Manual', label: 'manuale'},
    {value: 'Program', label: 'programma'},
    {value: 'Holiday', label: 'vacanza'},
    {value: 'TempProg', label: 'temporaneo'}
];

// limiti impostati sul termostato (set_temp_min e set_temp_max, letti il 15/11): il modello accetta 0,5-122 perché vale anche in °F; passo dei bottoni
const TARGET_TEMPERATURE_MIN: number = 5;
const TARGET_TEMPERATURE_MAX: number = 35;
const TARGET_TEMPERATURE_STEP: number = 0.5;


// dettaglio dedicato del termostato: temperatura ambiente, relè, temperatura impostata e modo.
// L'accensione resta alla pagina e lo stato aggiornato arriva dalla sua WebSocket
@Component({
    selector: 'thermostat-detail-component',
    standalone: true,
    imports: [Button],
    templateUrl: './thermostat-detail.component.html',
    styleUrl: './thermostat-detail.component.css'
})
export class ThermostatDetailComponent {

    @Input({ required: true }) device!: DeviceType;

    private readonly deviceApi = inject(DeviceApiService);

    protected readonly inWaiting = signal<boolean>(false);
    protected readonly errorMessage = signal<string>('');

    // il template legge solo i membri del componente: le costanti di modulo si riespongono qui, come nel clima
    protected readonly MODE_OPTIONS = MODE_OPTIONS;
    protected readonly TARGET_TEMPERATURE_MIN = TARGET_TEMPERATURE_MIN;
    protected readonly TARGET_TEMPERATURE_MAX = TARGET_TEMPERATURE_MAX;
    protected readonly TARGET_TEMPERATURE_STEP = TARGET_TEMPERATURE_STEP;


    // unico metodo dei comandi: SET:<valore> sul canale; il componente non aggiorna status da solo
    protected setValue(channelKey: string, value: string | number): void {

        this.inWaiting.set(true);
        this.errorMessage.set('');

        firstValueFrom(this.deviceApi.deviceAction(this.device.id, channelKey, 'SET:'+ value))
            .then(() => {
                this.inWaiting.set(false);
            })
            .catch((e: any) => {
                console.log('errore in setValue di ThermostatDetailComponent: impostazione del termostato');
                console.log(e);
                this.inWaiting.set(false);
                // il Core dei dispositivi risponde {error: '<messaggio>'}
                this.errorMessage.set(e?.error || 'comando non riuscito');
            })
        ;
    }
}
