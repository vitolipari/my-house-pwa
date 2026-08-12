export type DeviceProtocol = 'matter' | 'shelly' | 'tuya' | 'remotenow' | 'manual';

export type DeviceCategoryId = 'ACTUATOR' | 'SENSOR' | 'SENSOR_ACTUATOR';

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
    category: DeviceCategoryId | null;
    categoryName: string | null;
    functionalType: string | null;
    functionalTypeName: string | null;
    usage: string | null;
    usageName: string | null;
    detectedDeviceType: string | null;
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

export interface DeviceCategoryDefinition {
    id: DeviceCategoryId;
    name: string;
    description: string | null;
}

export interface DeviceTypeDefinition {
    id: string;
    name: string;
    category: DeviceCategoryId;
    description: string | null;
}

export interface DeviceUsageDefinition {
    id: string;
    name: string;
    description: string | null;
}

export interface DeviceTaxonomy {
    categories: DeviceCategoryDefinition[];
    types: DeviceTypeDefinition[];
    usages: DeviceUsageDefinition[];
}

export interface DiscoveredDevice {
    discoveryId: string;
    protocol: DeviceProtocol;
    integration: string;
    externalId: string;
    name: string;
    address: string | null;
    matterNodeId: string | null;
    detectedDeviceType: string | null;
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
    functionalType?: string | null;
    usage?: string | null;
    detectedDeviceType?: string | null;
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


export type DevicePropertyKind = 'STATE' | 'SETTING' | 'MEASUREMENT';
export type DevicePropertyAccess = 'READ' | 'WRITE' | 'READ_WRITE';

export interface DevicePropertyValue {
    id: string;
    kind: DevicePropertyKind;
    access: DevicePropertyAccess;
    value: number | string | boolean | null;
    unit: string | null;
    channelIndex?: number;
    minThreshold?: number | string | null;
    maxThreshold?: number | string | null;
}

export type ActuatorDevice = DeviceRecord & {category: 'ACTUATOR'};
export type SensorDevice = DeviceRecord & {
    category: 'SENSOR';
    measurements: DevicePropertyValue[];
};
export type SensorActuatorDevice = DeviceRecord & {
    category: 'SENSOR_ACTUATOR';
    measurements: DevicePropertyValue[];
};

export type ClassifiedDevice = ActuatorDevice | SensorDevice | SensorActuatorDevice;

export type TvDevice = ActuatorDevice & {functionalType: 'TV'};
export type AirConditionerDevice = ActuatorDevice & {functionalType: 'AIR_CONDITIONER'};
export type SensingAirConditionerDevice = SensorActuatorDevice & {
    functionalType: 'SENSING_AIR_CONDITIONER';
};
export type ThermostatDevice = SensorActuatorDevice & {functionalType: 'THERMOSTAT'};
export type GameConsoleDevice = ActuatorDevice & {functionalType: 'GAME_CONSOLE'};

