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
export type BinaryStateSensorDevice = SensorDevice & {functionalType: 'BINARY_STATE_SENSOR'};



// dallo schema

export type DeviceFamilyType = {

}

export type TuyaFamilyType = DeviceFamilyType & {
    id: number | string;
    localKey: number | string;
}

export type ShellySystemConfig = {}
export type ShellySystemStatus = {}
export type ShellyWifiConfig = {}
export type ShellyWifiStatus = {}
export type ShellyCloudConfig = {}
export type ShellyCloudStatus = {}

export type ShellyFamilyType = DeviceFamilyType & {
    id: number | string;
    name: string;
    gen: string;
    systemConfig: ShellySystemConfig;
    systemStatus: ShellySystemStatus;
    wifiConfig: ShellyWifiConfig;
    wifiStatus: ShellyWifiStatus;
    cloudConfig: ShellyCloudConfig;
    cloudStatus: ShellyCloudStatus;
}

export type MatterType = {
    id: number | string;
    mode: string;
    nodeID: number | string;
    fabricID: number | string;
    endpiontIDs: Array<number | string | boolean | null>;
    bridgeEndpiontIDs: Array<number | string | boolean | null>;
}


export type DeviceTipology = {
    id: number | string;
    name: string;
    description: string;
}

export type DeviceCategory = {
    id: number | string;
    name: string;
    description: string;
}

export type ZoneType = {
    id: number | string;
    name: string;
    picture: string;
}

export type DeviceType = {
    id: number | string;
    family: string;
    hardware: DeviceFamilyType;
    model: string;
    matter: MatterType;
    name: string;
    ip: string;
    mac: string;
    where: ZoneType;
    onMap: string;
    description: string;
    signalStatus: number;
    cloud: string;
    firmware: string;
    availability: string;
    catalogItemId: string;
    type: DeviceTipology;
    category: DeviceCategory;
    svgIcon: string;
    emoj: string;
    imgIcon: string;
    picture: string;
    channel: string[];
    status: Array<number | string | boolean | null>;
    lastTime: Array<number | string | null>;
}

export type ActuatorType = DeviceType & {}

export type SensorType = DeviceType & {
    unit: string[] | null;
    value: Array<number | string | boolean | null>;
    minThreshold: Array<number | string | boolean | null>;
    maxThreshold: Array<number | string | boolean | null>;
}

export type SensorActuatorType = ActuatorType & SensorType & {}

export type ClimaType = ActuatorType & {
    mode: string;
    temperature: number;
    fan: number | string;
    airFlowVertical: number | string;
    airFlowHorizontal: number | string;
}

export type SwitchType = ActuatorType & {}

export type DimmerType = ActuatorType & {}

export type CurtainType = ActuatorType & {
    movement: string;
    targetPosition: number;
}

export type TVType = ActuatorType & {
    volume: number | string;
    input: number | string;
    app: number | string;
}

export type MeteredSwitchType = SensorActuatorType & {}
export type MeteredDimmerType = SensorActuatorType & {}
export type MeteredCurtainType = SensorActuatorType & CurtainType & {}

export type TermostateType = SensorActuatorType & {
    mode: string;
    temperature: number;
}

export type PowerMeterType = SensorActuatorType & {}


export type TemperatureHumiditySensor = SensorType & {}

export type LightSensor = SensorType & {}

export type MovementSensor = SensorType & {}

export type WaterLevelSensor = SensorType & {}

export type BinaryStateSensor = SensorType & {}

