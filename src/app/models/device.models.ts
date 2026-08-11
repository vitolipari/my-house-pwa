export type DeviceProtocol = 'matter' | 'shelly' | 'tuya' | 'manual';

export interface DeviceRecord {
    id: number;
    name: string;
    address: string | null;
    place: string | null;
    description: string | null;
    mac: string | null;
    protocol: DeviceProtocol;
    integration: string;
    externalId: string;
    matterNodeId: string | null;
    matterFabricId: string | null;
    status: 'DISCOVERED' | 'COMMISSIONING' | 'ONLINE' | 'OFFLINE' | 'UNAVAILABLE' | 'ERROR';
    reachable: boolean | null;
    deviceType: string | null;
    vendorId: number | null;
    productId: number | null;
    capabilities: string[];
    metadata: Record<string, unknown>;
    lastSeenAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface DeviceIntegrationStatus {
    id: string;
    enabled: boolean;
    ready: boolean;
    reason: string | null;
    commissioningOverIp?: boolean;
    commissioningOverBle?: boolean;
}

export interface DiscoveredDevice {
    discoveryId: string;
    protocol: DeviceProtocol;
    integration: string;
    externalId: string;
    name: string;
    address: string | null;
    matterNodeId: string | null;
    deviceType: string | null;
    vendorId: number | null;
    productId: number | null;
    commissionable: boolean;
    alreadyCommissioned: boolean;
    reachable: boolean | null;
    pairingHint: number | null;
    pairingInstructions: string | null;
}

export interface DiscoveryResult {
    discoveredAt: string;
    durationMs: number;
    integrations: Array<DeviceIntegrationStatus & {error?: string | null}>;
    devices: DiscoveredDevice[];
}

export interface AddDeviceRequest {
    name: string;
    protocol: DeviceProtocol;
    integration?: string;
    externalId: string;
    address?: string | null;
    place?: string | null;
    description?: string | null;
    mac?: string | null;
    deviceType?: string | null;
}

export interface CommissionMatterRequest {
    pairingCode: string;
    name?: string;
    place?: string | null;
    description?: string | null;
}

export interface CommissioningJob {
    id: string;
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
    createdAt: string;
    updatedAt: string;
    device?: DeviceRecord;
    error?: string;
}


// dallo schema v1 /////////////////////////////////////////////////////////////////////////

export type ShellyType = {
    id: number | string;
    name: string;
    gen: string;
    wifiAccessPointName: string;
    systemConfig: {};
    systemStatus: {};
    wifiConfig: {};
    wifiStatus: {};
    cloudConfig: {};
    cloudStatus: {};
};

export type TuyaType = {
    id: number | string;
    localKey: string;
};

export type MatterType = {
    id: number | string;
    nodeID: string;
    fabricID: string;
    endpointIDs: number[];
    bridgeEndpointIDs: number[];
};

export type DeviceType = {
    id: number;
    family: ShellyType | TuyaType;
    matter: MatterType;
    name: string;
    ip: string;
    mac: string;
    status: string;
    where: string;
    onMap: string;
    description: string;
    signalStatus: number;
    cloud: string;
    firmware: string;
    availability: string;
};

export type ActuatorType = DeviceType & {};

export type SensorActuatorType = DeviceType & {
    unit: string[];
    value: number[] | string[];
    minThreshold: number[] | string[];
    maxThreshod: number[] | string[];
};

export type SensorType = DeviceType & {
    unit: string[];
    value: number[] | string[];
    minThreshold: number[] | string[];
    maxThreshod: number[] | string[];
};

export type ClimaType = ActuatorType & {
    mode: string;
    temperature: number;
    fan: number | string;
    airFlowVertical: number | string;
    airFlowHorizontal: number | string;
};

export type SwitchType = ActuatorType & {}

export type DimmerType = ActuatorType & {}

export type CurtainType = ActuatorType & {}

export type TermostateType = SensorActuatorType & {
    mode: string;
    temperature: number;
}

export type PowerMeterType = SensorActuatorType & {}

export type TemperatureHumiditySensorType = SensorType & {}

export type LightSensorType = SensorType & {}

export type MovementSensorType = SensorType & {}

export type WayerLevelSensorType = SensorType & {}


