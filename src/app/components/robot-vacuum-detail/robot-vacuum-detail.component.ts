import {Component, inject, Input, signal} from '@angular/core';
import {firstValueFrom} from 'rxjs';
import {Button} from 'primeng/button';
import {DeviceType} from '../../pages/devices/devices.models';
import {DeviceApiService} from '../../pages/devices/device-api';


// valori del modello Tuya del robot (MEDION S10 SW, categoria sd, letto il 21/11): la PWA manda SET:<valore>, il Core li controlla.
// Il modo chargego (ritorno alla base) ha un bottone suo, standby resta fuori
const MODE_OPTIONS: {value: string, label: string}[] = [
    {value: 'smart', label: 'automatico'},
    {value: 'wall_follow', label: 'bordi'},
    {value: 'spiral', label: 'spirale'}
];

const SUCTION_OPTIONS: {value: string, label: string}[] = [
    {value: 'quiet', label: 'silenziosa'},
    {value: 'normal', label: 'normale'},
    {value: 'strong', label: 'forte'}
];

// modi di pulizia del robot Matter (Ecovacs DEEBOT T50 OMNI Gen3, letti il 28/11): il valore è l'etichetta del robot.
// Il ritorno alla base resta il bottone «base» (SET:chargego), l'aspirazione via Matter non c'è
const MATTER_MODE_OPTIONS: {value: string, label: string}[] = [
    {value: 'Vacuum & Mop', label: 'aspira e lava'},
    {value: 'Vacuum-Only', label: 'solo aspira'},
    {value: 'Mopping', label: 'solo lava'},
    {value: 'Mop after Vacuum', label: 'aspira poi lava'}
];

// stati Matter in cui il robot va alla base o ci sta: il bottone «base» è pieno (per il Medion vale il modo chargego)
const BASE_STATUSES: string[] = ['SeekingCharger', 'Charging', 'Docked'];

// nomi dei codici di status osservati il 21/11 durante una pulizia e degli stati Matter del robot Ecovacs;
// gli altri codici si mostrano così come arrivano
const STATUS_LABELS: Record<string, string> = {
    '1': 'pulizia automatica',
    '4': 'rientro alla base',
    '5': 'in carica',
    'Stopped': 'fermo',
    'Running': 'in pulizia',
    'Paused': 'in pausa',
    'Error': 'errore',
    'SeekingCharger': 'rientro alla base',
    'Charging': 'in carica',
    'Docked': 'sulla base'
};


// dettaglio dedicato del robot aspirapolvere: stato, batteria, avvio, pausa e ritorno alla base, modo e aspirazione;
// per il robot Matter anche fase, stanza ed errore. L'accensione resta alla pagina e lo stato aggiornato arriva dalla sua WebSocket
@Component({
    selector: 'robot-vacuum-detail-component',
    standalone: true,
    imports: [Button],
    templateUrl: './robot-vacuum-detail.component.html',
    styleUrl: './robot-vacuum-detail.component.css'
})
export class RobotVacuumDetailComponent {

    @Input({ required: true }) device!: DeviceType;

    private readonly deviceApi = inject(DeviceApiService);

    protected readonly inWaiting = signal<boolean>(false);
    protected readonly errorMessage = signal<string>('');

    // il template legge solo i membri del componente: le costanti di modulo si riespongono qui, come nel termostato
    protected readonly MODE_OPTIONS = MODE_OPTIONS;
    protected readonly SUCTION_OPTIONS = SUCTION_OPTIONS;
    protected readonly MATTER_MODE_OPTIONS = MATTER_MODE_OPTIONS;
    protected readonly BASE_STATUSES = BASE_STATUSES;
    protected readonly STATUS_LABELS = STATUS_LABELS;


    // unico metodo dei comandi: SET:<valore> sul canale (SET:true e SET:false su cleaning per avvio e pausa);
    // il componente non aggiorna status da solo
    protected setValue(channelKey: string, value: string): void {

        this.inWaiting.set(true);
        this.errorMessage.set('');

        firstValueFrom(this.deviceApi.deviceAction(this.device.id, channelKey, 'SET:'+ value))
            .then(() => {
                this.inWaiting.set(false);
            })
            .catch((e: any) => {
                console.log('errore in setValue di RobotVacuumDetailComponent: comando del robot');
                console.log(e);
                this.inWaiting.set(false);
                // il Core dei dispositivi risponde {error: '<messaggio>'}
                this.errorMessage.set(e?.error || 'comando non riuscito');
            })
        ;
    }
}
