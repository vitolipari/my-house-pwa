import {CommonModule} from '@angular/common';
import {Component, inject, OnInit, signal} from '@angular/core';
import {firstValueFrom, Observable} from 'rxjs';
import {QRCodeComponent} from 'angularx-qrcode';
import {PageTitleComponent} from '../../components/page-title.component/page-title.component';
import {DeviceApiService} from '../devices/device-api';
import {MatterBridgeStatus} from '../devices/devices.models';

// Bridge Matter di LipariOS: codice per aggiungere i dispositivi della casa ad Apple Casa, Google Home
// o Alexa, ecosistemi già collegati e loro rimozione
@Component({
    selector: 'matter-bridge-page',
    standalone: true,
    imports: [CommonModule, PageTitleComponent, QRCodeComponent],
    templateUrl: './matter-bridge.page.html',
    styleUrls: ['../../../page.css', './matter-bridge.page.css']
})
export class MatterBridgePage implements OnInit {
    private readonly deviceApi = inject(DeviceApiService);

    readonly status = signal<MatterBridgeStatus | null>(null);
    readonly loading = signal(true);
    readonly inWaiting = signal(false);
    readonly error = signal<string | null>(null);
    // pairing riaperto per un altro ecosistema: il codice si mostra anche se il Bridge è già collegato
    readonly pairingOpen = signal(false);

    ngOnInit(): void {
        this.run(this.deviceApi.matterBridge(), 'lettura dello stato del Bridge Matter');
    }

    // riapre il pairing: serve per aggiungere il Bridge a un secondo ecosistema
    openPairing(): void {
        this.pairingOpen.set(true);
        this.run(this.deviceApi.openMatterBridgePairing(), 'apertura del pairing del Bridge Matter');
    }

    // l'ecosistema indicato non vedrà più i dispositivi di LipariOS
    removeFabric(fabricIndex: number): void {
        this.run(this.deviceApi.removeMatterBridgeFabric(fabricIndex), `rimozione della fabric ${fabricIndex} dal Bridge Matter`);
    }

    // esegue una chiamata che restituisce lo stato del Bridge e chiude attesa ed errore in entrambi i rami
    private run(request: Observable<MatterBridgeStatus>, operation: string): void {
        this.inWaiting.set(true);
        this.error.set(null);
        firstValueFrom(request)
            .then((status: MatterBridgeStatus) => {
                this.status.set(status);
                this.loading.set(false);
                this.inWaiting.set(false);
            })
            .catch((e: any) => {
                console.log(`errore in MatterBridgePage: ${operation}`);
                console.log(e);
                this.error.set(e?.error?.error || 'Operazione sul Bridge Matter non riuscita');
                this.loading.set(false);
                this.inWaiting.set(false);
            });
    }
}
