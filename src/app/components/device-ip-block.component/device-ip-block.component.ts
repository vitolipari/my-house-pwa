import {Component, Input} from '@angular/core';


export type NetworkServiceIdentity = {
    port: number;
    protocol: string;
    name: string | null;
    product: string | null;
    version: string | null;
    extraInfo: string | null;
    hostname: string | null;
    tunnel: string | null;
    deviceType: string | null;
    operatingSystem: string | null;
    cpe: string[];
    httpTitle: string | null;
};

export type ShellyDeviceIdentity = {
    name: string | null;
    id: string | null;
    mac: string;
    model: string | null;
    type: string | null;
    app: string | null;
    generation: number;
    firmware: string | null;
};

export type NetworkIdentity = {
    ip: string;
    mac: string;
    vendor: string | null;
    privateMac: boolean;
    deviceManufacturer: string | null;
    productName: string | null;
    hostname: string | null;
    deviceType: string | null;
    operatingSystem: string | null;
    httpTitle: string | null;
    identificationSource: "shelly-api" | "hardware-cpe" | "service-detection" | "http-title" | null;
    shelly: ShellyDeviceIdentity | null;
    services: NetworkServiceIdentity[];
};

@Component({
    selector: 'device-ip-block',
    imports: [],
    templateUrl: './device-ip-block.component.html',
    styleUrls: [
        // '../../components/user-block.component/user-block.component.css',
        './device-ip-block.component.css'
    ],
    standalone: true
})
export class DeviceIpBlockComponent {

    @Input() ipDevice!: NetworkIdentity;

    get displayName(): string {
        const manufacturer =
            this.ipDevice.deviceManufacturer
            ?? (this.ipDevice.vendor?.toLowerCase().trim() !== 'espressif'
                ? this.ipDevice.vendor
                : null)
        ;
        const product = this.ipDevice.productName
            ?? this.ipDevice.hostname
            ?? this.ipDevice.httpTitle;

        if (!manufacturer) {
            return product ?? this.ipDevice.vendor ?? 'Dispositivo non identificato';
        }

        if (!product || product.toLowerCase().includes(manufacturer.toLowerCase())) {
            return product ?? manufacturer;
        }

        return `${manufacturer} · ${product}`;
    }

    get deviceTypeIcon(): string {

        // gestione del tipo
        switch (this.ipDevice.deviceType) {
            case null:
            case '':
                return '';
            case 'IoT device':
                return 'icon-209';
        }

        return "";

    }


}
