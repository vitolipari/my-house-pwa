import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {
    CommissioningJob,
    CommissionMatterRequest,
    DeviceIntegrationStatus,
    DeviceCatalogItem,
    DeviceType,
    DeviceTaxonomy,
    DiscoveryResult,
    MatterBridgeStatus
} from './devices.models';

@Injectable({providedIn: 'root'})
export class DeviceApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = '/api/core';

    list(): Observable<DeviceType[]> {
        return this.http.get<DeviceType[]>(`${this.baseUrl}/devices`);
    }

    search(params: {
        pageSize?: number;
        pageNumber?: number;
        name?: string;
        family?: string;
        model?: string;
        description?: string;
        firmware?: string;
        productName?: string;
        hostName?: string;
        ids?: number[] | string[];
        ips?: string[];
        macs?: string[];
        zones?: number[] | string[];
        channels?: number[] | string[];
        types?: number[] | string[];
        categories?: number[] | string[];
        usages?: number[] | string[];
        catalogItemIds?: number[] | string[];
        status?: number[] | string[];
        availability?: string;
        lastTime?: string | number;
        signalStatus?: string;
        matter?: 'NATIVE' | 'BRIDGED';
    }): Observable<DeviceType[]> {
        return this.http.get<DeviceType[]>(`${this.baseUrl}/devices`, {params});
    }

    integrations(): Observable<DeviceIntegrationStatus[]> {
        return this.http.get<DeviceIntegrationStatus[]>(`${this.baseUrl}/devices/integrations`);
    }

    taxonomy(): Observable<DeviceTaxonomy> {
        return this.http.get<DeviceTaxonomy>(`${this.baseUrl}/devices/taxonomy`);
    }

    catalog(): Observable<DeviceCatalogItem[]> {
        return this.http.get<DeviceCatalogItem[]>(`${this.baseUrl}/devices/catalog`);
    }

    discover(timeoutSeconds = 8): Observable<DiscoveryResult> {
        return this.http.post<DiscoveryResult>(`${this.baseUrl}/devices/discover`, {timeoutSeconds});
    }

    commissionMatter(payload: CommissionMatterRequest): Observable<CommissioningJob> {
        return this.http.post<CommissioningJob>(`${this.baseUrl}/devices/matter/commission`, payload);
    }

    commissioningJob(jobId: string): Observable<CommissioningJob> {
        return this.http.get<CommissioningJob>(`${this.baseUrl}/devices/matter/commission/${jobId}`);
    }

    // Bridge Matter: stato, riapertura del pairing per un altro ecosistema, rimozione di un ecosistema
    matterBridge(): Observable<MatterBridgeStatus> {
        return this.http.get<MatterBridgeStatus>(`${this.baseUrl}/devices/matter/bridge`);
    }

    openMatterBridgePairing(): Observable<MatterBridgeStatus> {
        return this.http.post<MatterBridgeStatus>(`${this.baseUrl}/devices/matter/bridge/pairing`, {});
    }

    removeMatterBridgeFabric(fabricIndex: number): Observable<MatterBridgeStatus> {
        return this.http.delete<MatterBridgeStatus>(`${this.baseUrl}/devices/matter/bridge/fabric/${fabricIndex}`);
    }

    loadDeviceStatus(deviceId: number | string): Observable<DeviceType> {
        return this.http.get<DeviceType>(`${this.baseUrl}/device/status/${deviceId}`);
    }

    // azione TIPO:VALORE su un canale dell'attuatore; il canale è la chiave del DeviceType (es. output)
    deviceAction(deviceId: number | string, channel: string, action: string): Observable<unknown> {
        return this.http.put<unknown>(`${this.baseUrl}/device/${deviceId}/action`, {channel, action});
    }
}
