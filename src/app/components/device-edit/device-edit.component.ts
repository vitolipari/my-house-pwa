import {Component, inject, Input, OnInit, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {firstValueFrom} from 'rxjs';
import {Button} from 'primeng/button';
import {InputText} from 'primeng/inputtext';
import {Select} from 'primeng/select';
import {DeviceCatalogItem, DeviceType, ZoneType} from '../../pages/devices/devices.models';
import {DeviceApiService} from '../../pages/devices/device-api';
import {ApiUrlService} from '../../services/api-url-service';
import {getLastElementOr} from '../../utils/array-util';

// «Nessuna Stanza», come nella registrazione: con questa scelta il Core toglie il dispositivo da tutte le stanze
const NO_ROOM: ZoneType = {id: -1, name: 'Nessuna Stanza', device_list: '', picture: ''};

@Component({
    selector: 'device-edit-component',
    imports: [FormsModule, Button, InputText, Select],
    templateUrl: './device-edit.component.html',
    styleUrl: './device-edit.component.css'
})
export class DeviceEditComponent implements OnInit {

    // dispositivo da modificare: nome, stanza e voce di catalogo partono dai suoi valori
    @Input({ required: true }) device!: DeviceType;

    // cosa fare a modifica riuscita, con il dispositivo restituito dal Core; arrow function della pagina,
    // come exitOnDelete di DeleteConfirmComponent
    @Input({ required: true }) exitOnSave!: (device: DeviceType) => void;

    private readonly deviceApi = inject(DeviceApiService);
    private readonly api = inject(ApiUrlService);

    protected name: string = '';
    protected roomID: number | string = NO_ROOM.id;
    protected catalogItemId: string = '';
    protected readonly rooms = signal<ZoneType[]>([]);
    protected readonly catalog = signal<DeviceCatalogItem[]>([]);
    protected readonly inWaiting = signal<boolean>(true);
    protected readonly errorMessage = signal<string>('');


    // valori di partenza dal dispositivo; si offrono solo le voci di catalogo compatibili con il suo tipo, che non cambia
    ngOnInit() {

        this.name = this.device.name;
        this.roomID = (this.device.where ?? [])
            .map((room: ZoneType) => room.id)
            .reduce(getLastElementOr, NO_ROOM.id)
        ;
        this.catalogItemId = this.device.catalogItemId;

        Promise.all([
            firstValueFrom(this.api.getAllRooms()),
            firstValueFrom(this.deviceApi.catalog())
        ])
            .then(([rooms, catalog]: [ZoneType[], DeviceCatalogItem[]]) => {
                this.rooms.set([...rooms, NO_ROOM]);
                this.catalog.set(
                    catalog
                        .filter((item: DeviceCatalogItem) => item.compatibleTypes.includes(''+ this.device.type.id))
                );
                this.inWaiting.set(false);
            })
            .catch((e: any) => {
                console.log('errore in ngOnInit di DeviceEditComponent: lettura di stanze e catalogo');
                console.log(e);
                this.inWaiting.set(false);
                this.errorMessage.set('stanze o catalogo non disponibili');
            })
        ;
    }


    // manda al Core il dispositivo con nome, stanza e voce di catalogo scelti; il resto resta quello ricevuto
    protected save() {

        this.inWaiting.set(true);
        this.errorMessage.set('');

        firstValueFrom(this.deviceApi.editDevice({
            ...this.device,
            name: this.name.trim(),
            where: this.rooms()
                .filter((room: ZoneType) => room.id === this.roomID)
                .filter((room: ZoneType) => room.id !== NO_ROOM.id),
            catalogItemId: this.catalogItemId
        }))
            .then((device: DeviceType) => {
                this.inWaiting.set(false);
                this.exitOnSave(device);
            })
            .catch((e: any) => {
                console.log('errore in save di DeviceEditComponent: modifica del dispositivo');
                console.log(e);
                this.inWaiting.set(false);
                // il Core dei dispositivi risponde {error: '<messaggio>'}
                this.errorMessage.set(e?.error || 'modifica non riuscita');
            })
        ;
    }
}
