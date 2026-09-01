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
    DiscoveryResult
} from './devices.models';

@Injectable({providedIn: 'root'})
export class DeviceApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = '/api/core';

    list(): Observable<DeviceType[]> {
        return this.http.get<DeviceType[]>(`${this.baseUrl}/devices`);
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

    loadDeviceStatus(deviceId: number | string): Observable<DeviceType> {
        return this.http.get<DeviceType>(`${this.baseUrl}/device/status/${deviceId}`);
    }
}
