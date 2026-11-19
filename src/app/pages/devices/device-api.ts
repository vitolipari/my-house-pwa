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
    MatterBridgeStatus, GroupType, ZoneType
} from './devices.models';
import {FullTimerType} from '../timer/timer.models';
import {ScenarioType} from '../scenario/scenario.models';
import {HistoricDataType, SearchHistoricDataType} from '../device-details/device-details.page';

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

    // controllo di MAC e IP dei dispositivi nel Core (refreshMacIp), chiesto a ogni avvio o refresh della PWA
    refreshMacIp(): Observable<unknown> {
        return this.http.post<unknown>(`${this.baseUrl}/devices/addresses`, {});
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

    // dispositivo completo, con configurazione e stato del dispositivo, dalla cache del Core (la lista non li porta)
    getDevice(deviceId: number | string): Observable<DeviceType> {
        return this.http.get<DeviceType>(`${this.baseUrl}/device/${deviceId}`);
    }

    loadDeviceStatus(deviceId: number | string): Observable<DeviceType> {
        return this.http.get<DeviceType>(`${this.baseUrl}/device/${deviceId}/status`);
    }

    // azione TIPO:VALORE su un canale dell'attuatore; il canale è la chiave del DeviceType (es. output)
    deviceAction(deviceId: number | string, channel: string, action: string): Observable<unknown> {
        console.log('PUT action');
        console.log(action);
        return this.http.put<unknown>(`${this.baseUrl}/device/${deviceId}/action`, {channel, action});
    }

    deleteDevices(param: (number | string)[]): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/devices?ids=${ param.join(',') }`);
    }

    // modifica di nome, stanza e voce di catalogo: il Core legge solo name, where, catalogItemId e type.id
    editDevice(device: DeviceType): Observable<DeviceType> {
        return this.http.put<DeviceType>(`${this.baseUrl}/device/${ device.id }`, device);
    }

    getAllTimersByDeviceId(deviceId: number): Observable<FullTimerType[]> {
        return this.http.get<FullTimerType[]>(`${this.baseUrl}/device/${deviceId}/timers`);
    }

    getAllScenarioByDeviceId(deviceId: number): Observable<ScenarioType[]> {
        return this.http.get<ScenarioType[]>(`${this.baseUrl}/device/${deviceId}/scenarios`);
    }

    getAllGroupByDeviceId(deviceId: number): Observable<GroupType[]> {
        return this.http.get<GroupType[]>(`${this.baseUrl}/device/${deviceId}/groups`);
    }

    getRoomDeviceId(deviceId: number): Observable<ZoneType> {
        return this.http.get<ZoneType>(`${this.baseUrl}/device/${deviceId}/rooms`);
    }

    getStoricalData(search: SearchHistoricDataType): Observable<HistoricDataType[]> {
        let queryString: string = Object.keys( search ).map( (key: string) => `${ key }=${ ''+ search[key as keyof SearchHistoricDataType] }` ).join('&');
        return this.http.get<HistoricDataType[]>(`${this.baseUrl}/device/${ search.device }/data?${ queryString }`);
    }

}
