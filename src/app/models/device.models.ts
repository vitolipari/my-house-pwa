export type DeviceProtocol = 'matter' | 'shelly' | 'tuya' | 'bluetooth' | 'remotenow' | 'manual';

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

export interface DeviceCatalogItem {
    id: string;
    name: string;
    svgIcon: string | null;
    emojIcon: string | null;
    imgIcon: string | null;
    description: string | null;
    source: 'USAGE' | 'TYPE';
    usage: string | null;
    compatibleTypes: string[];
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
    catalogItemId?: string | null;
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

export interface SensorData {
    unit: string[];
    value: Array<number | string>;
    minThreshold: Array<number | string | null>;
    maxThreshold: Array<number | string | null>;
}

export type ActuatorDevice = DeviceRecord & {category: 'ACTUATOR'};
export type SensorDevice = DeviceRecord & SensorData & {category: 'SENSOR'};
export type SensorActuatorDevice = DeviceRecord & SensorData & {category: 'SENSOR_ACTUATOR'};

export type ClassifiedDevice = ActuatorDevice | SensorDevice | SensorActuatorDevice;

export type TvDevice = ActuatorDevice & {functionalType: 'TV'};
export type AirConditionerDevice = ActuatorDevice & {functionalType: 'AIR_CONDITIONER'};
export type SensingAirConditionerDevice = SensorActuatorDevice & {
    functionalType: 'SENSING_AIR_CONDITIONER';
};
export type ThermostatDevice = SensorActuatorDevice & {functionalType: 'THERMOSTAT'};
export type GameConsoleDevice = ActuatorDevice & {functionalType: 'GAME_CONSOLE'};
export type PrinterDevice = ActuatorDevice & {functionalType: 'PRINTER'};
export type ThreeDPrinterDevice = SensorActuatorDevice & {functionalType: 'THREE_D_PRINTER'};
export type PowerMeterDevice = SensorActuatorDevice & {functionalType: 'POWER_METER'};
export type EnergyMeterDevice = SensorDevice & {functionalType: 'ENERGY_METER'};
export type SolarSystemMonitorDevice = SensorDevice & {functionalType: 'SOLAR_SYSTEM_MONITOR'};
export type LightSensorDevice = SensorDevice & {functionalType: 'LIGHT_SENSOR'};
export type WaterLevelSensorDevice = SensorDevice & {functionalType: 'WATER_LEVEL_SENSOR'};
export type FireSensorDevice = SensorDevice & {functionalType: 'FIRE_SENSOR'};
export type SmartWatchDevice = SensorActuatorDevice & {functionalType: 'SMART_WATCH'};
export type HeadphonesDevice = ActuatorDevice & {functionalType: 'HEADPHONES'};
export type SpeakerDevice = ActuatorDevice & {functionalType: 'SPEAKER'};
export type ColorDimmerDevice = ActuatorDevice & {functionalType: 'COLOR_DIMMER'};
export type MotorizedCanopyDevice = ActuatorDevice & {functionalType: 'MOTORIZED_CANOPY'};
export type MotorizedDynamicCanopyDevice = ActuatorDevice & {functionalType: 'MOTORIZED_DYNAMIC_CANOPY'};
export type GateDevice = ActuatorDevice & {functionalType: 'GATE'};
export type DoorDevice = ActuatorDevice & {functionalType: 'DOOR'};
export type CarDevice = SensorActuatorDevice & {functionalType: 'CAR'};
export type ElectricCarDevice = SensorActuatorDevice & {functionalType: 'ELECTRIC_CAR'};
export type MotorcycleDevice = SensorActuatorDevice & {functionalType: 'MOTORCYCLE'};
export type ElectricScooterDevice = SensorActuatorDevice & {functionalType: 'ELECTRIC_SCOOTER'};
export type ElectricBicycleDevice = SensorActuatorDevice & {functionalType: 'ELECTRIC_BICYCLE'};
export type GpsTagDevice = SensorDevice & {functionalType: 'GPS_TAG'};
