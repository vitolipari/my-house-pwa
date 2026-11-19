import {inject, Injectable, signal} from '@angular/core';
import {firstValueFrom, Subject} from 'rxjs';
import {DeviceApiService} from './device-api';
import {DeviceType} from './devices.models';

// attesa prima di riaprire la WebSocket caduta: con il Core o la rete assenti non si riprova di continuo
const CHANNEL_RETRY_MS = 5_000;


// Elenco dei dispositivi condiviso da tutte le pagine: si legge dal Core una volta sola e lo tiene aggiornato l'unica
// WebSocket dell'app. Si rilegge dopo un inserimento, una modifica o un'eliminazione (dispositivi o stanze) e quando la
// WebSocket si riapre, perché i messaggi arrivati mentre era chiusa sono persi
@Injectable({providedIn: 'root'})
export class DeviceStoreService {

    private readonly deviceApi = inject(DeviceApiService);

    readonly devices = signal<DeviceType[]>([]);
    // ogni DeviceType arrivato dalla WebSocket, per le pagine che a ogni aggiornamento fanno qualcosa in più
    readonly deviceUpdates = new Subject<DeviceType>();

    private loading: Promise<DeviceType[]> | null = null;     // lettura dal Core, in corso o finita; null = da rifare
    private channel: WebSocket | null = null;


    constructor() {

        this.openChannel(false);

        // tornando in primo piano (telefono sbloccato, PWA riaperta) la WebSocket può essere caduta senza che il browser
        // l'abbia ancora chiusa: se ne apre una nuova, e con lei si rilegge la lista
        document.addEventListener('visibilitychange', () => {

            if( document.visibilityState !== 'visible' ) {
                return;
            }

            if( !!this.channel ) {
                this.channel.onclose = null;
                this.channel.close();
                this.channel = null;
            }
            this.openChannel(true);
        });
    }


    // elenco dei dispositivi: dal Core la prima volta e con reload, altrimenti quello già letto, con gli aggiornamenti
    // arrivati dalla WebSocket
    loadDevices(reload: boolean = false): Promise<DeviceType[]> {

        if( !!this.loading && !reload ) {
            return (
                this.loading
                    .then(() => this.devices())
                    .catch((e: any) => {
                        console.log('errore in loadDevices di DeviceStoreService: attesa della lettura in corso');
                        console.log(e);
                        return Promise.reject(e);
                    })
            );
        }

        this.loading =
            firstValueFrom(this.deviceApi.list())
                .then((devices: DeviceType[]) => {
                    this.devices.set(devices);
                    return devices;
                })
                .catch((e: any) => {
                    console.log('errore in loadDevices di DeviceStoreService: lettura dei dispositivi');
                    console.log(e);
                    // la prossima pagina che chiede la lista riprova
                    this.loading = null;
                    return Promise.reject(e);
                })
        ;
        return this.loading;
    }

    // dopo un inserimento, una modifica o un'eliminazione di dispositivi o stanze: la prossima pagina rilegge la lista
    forgetDevices(): void {
        this.loading = null;
    }


    // apre l'unica WebSocket con il Core; con reload, appena aperta, rilegge la lista se era già stata letta
    private openChannel(reload: boolean): void {

        if( !!this.channel ) {
            return;
        }

        let protocol: string = (location.protocol === 'https:') ? 'wss://' : 'ws://';
        let channel: WebSocket = new WebSocket(protocol + location.host + '/api/core/');
        this.channel = channel;

        channel.onopen = () => {

            if( reload && !!this.loading ) {
                this.loadDevices(true)
                    .then((devices: DeviceType[]) => devices)
                    .catch((e: any) => {
                        console.log('errore in openChannel di DeviceStoreService: rilettura dei dispositivi alla riapertura');
                        console.log(e);
                        return [];
                    })
                ;
            }
        };

        // dal Core arriva il DeviceType di un dispositivo che ha cambiato lo stato o il valore di un canale: prende il
        // posto di quello con lo stesso id, poi passa alle pagine iscritte a deviceUpdates
        channel.onmessage = (msg: MessageEvent) => {

            try {
                let updatedDevice: DeviceType = JSON.parse(msg.data);

                this.devices
                    .update((devices: DeviceType[]) => (
                        devices
                            .map((device: DeviceType) => (device.id === updatedDevice.id) ? updatedDevice : device)
                    ))
                ;
                this.deviceUpdates.next(updatedDevice);
            }
            catch (e: any) {
                console.log('errore in onmessage di DeviceStoreService: messaggio della WebSocket non valido');
                console.log(e);
            }
        };

        // chiusa dal telefono in secondo piano, da un cambio di rete, da Nginx o dal Core fermo: si riapre più tardi
        channel.onclose = (event: CloseEvent) => {

            console.log(`WebSocket con il Core chiusa (codice ${ event.code }): si riapre fra ${ CHANNEL_RETRY_MS / 1000 } s`);
            this.channel = null;
            setTimeout(() => this.openChannel(true), CHANNEL_RETRY_MS);
        };
    }

}
