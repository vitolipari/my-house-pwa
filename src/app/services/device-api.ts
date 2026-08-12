import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {
    AddDeviceRequest,
    CommissioningJob,
    CommissionMatterRequest,
    DeviceIntegrationStatus,
    DeviceCatalogItem,
    DeviceRecord,
    DeviceTaxonomy,
    DiscoveryResult
} from '../models/device.models';

@Injectable({providedIn: 'root'})
export class DeviceApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = '/api/core/devices';

    list(): Observable<DeviceRecord[]> {
        return this.http.get<DeviceRecord[]>(this.baseUrl);
    }

    integrations(): Observable<DeviceIntegrationStatus[]> {
        return this.http.get<DeviceIntegrationStatus[]>(`${this.baseUrl}/integrations`);
    }

    taxonomy(): Observable<DeviceTaxonomy> {
        return this.http.get<DeviceTaxonomy>(`${this.baseUrl}/taxonomy`);
    }

    catalog(): Observable<DeviceCatalogItem[]> {
        return this.http.get<DeviceCatalogItem[]>(`${this.baseUrl}/catalog`);
    }

    discover(timeoutSeconds = 8): Observable<DiscoveryResult> {
        return this.http.post<DiscoveryResult>(`${this.baseUrl}/discover`, {timeoutSeconds});
    }

    add(payload: AddDeviceRequest): Observable<DeviceRecord> {
        return this.http.post<DeviceRecord>(this.baseUrl, payload);
    }

    commissionMatter(payload: CommissionMatterRequest): Observable<CommissioningJob> {
        return this.http.post<CommissioningJob>(`${this.baseUrl}/matter/commission`, payload);
    }

    commissioningJob(jobId: string): Observable<CommissioningJob> {
        return this.http.get<CommissioningJob>(`${this.baseUrl}/matter/commission/${jobId}`);
    }
}
