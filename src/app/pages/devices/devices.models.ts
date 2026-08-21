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



// dallo schema -------------------------------------------------------------------------------------

export type DeviceFamilyType = {

}

export type TuyaFamilyType = DeviceFamilyType & {
    id: number | string;
    localKey: number | string;
}

export type ShellySystemConfig = {
    device: {
        name: string | null;
        mac: string;
        fw_id: string;
        discoverable: boolean;
        eco_mode: boolean;
    };
    location: { tz: string; lat: number; lon: number; };
    debug: {
        level: number;
        file_level: any;
        mqtt: any;
        websocket: any;
        udp: any;
    };
    ui_data: {};
    rpc_udp: { dst_addr: string | null; listen_port: string | null };
    sntp: { server: string; };
    cfg_rev: number;
}

export type ShellySystemStatus = {
    mac: string;
    restart_required: boolean;
    time: string | number | Date;
    unixtime: number;
    uptime: number;
    ram_size: number;
    ram_free: number;
    fs_size: number;
    fs_free: number;
    cfg_rev: number;
    kvs_rev: number;
    schedule_rev: number;
    webhook_rev: number;
    available_updates: { stable: any };
    reset_reason: number
}

export type ShellyWifiConfig = {
    ap: {
        ssid: string;
        is_open: boolean;
        enable: boolean;
        range_extender: any;
    };
    sta: {
        ssid: string;
        is_open: boolean;
        enable: boolean;
        ipv4mode: string;
        ip: any;
        netmask: any;
        gw: any;
        nameserver: any;
    };
    sta1: {
        ssid: string | null;
        is_open: boolean;
        enable: boolean;
        ipv4mode: string | null;
        ip: any;
        netmask: any;
        gw: any;
        nameserver: any;
    };
    roam: { rssi_thr: number; interval: number }
}

export type ShellyWifiStatus = {
    sta_ip: string;
    status: string;
    ssid: string;
    rssi: number;
}

export type ShellyCloudConfig = { enable: boolean; server: string; }

export type ShellyCloudStatus = { connected: boolean; }

export type ShellyFamilyType = DeviceFamilyType & {
    id: number | string;
    name: string;
    gen: string;
    config: {
        Humidity: any;
        MQTT: any;
        Input: any;
        Shelly: any;
        Switch: any;
        Sys: any;
        Cloud: any;
        WiFi: any;
        BLE: any;
        Matter: any;
        Temperature: any;
        Light: any;
        RGB: any;
        Cover: any;
        Presence: any;
        Illuminance: any;
    },
    status: {
        Humidity: any;
        MQTT: any;
        Input: any;
        Shelly: any;
        Switch: any;
        Sys: any;
        Cloud: any;
        WiFi: any;
        BLE: any;
        Matter: any;
        Temperature: any;
        Light: any;
        RGB: any;
        Cover: any;
        Presence: any;
        Illuminance: any;
    }
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
    updateAvailability: any,
    productName: string;
    hostName: string;
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

// ------------------------------------------------------------------------------------------------

export let VOID_DEVICE_FAMILY: DeviceFamilyType = {}

export let VOID_TUYA_FAMILY: TuyaFamilyType = {
    id: 0,
    localKey: 0
}

export let VOID_SHELLY_SYSTEM_CONFIG: ShellySystemConfig = {
    device: {
        name: '',
        mac: '',
        fw_id: '',
        discoverable: true,
        eco_mode: false
    },
    location: { tz: '', lat: 0.0, lon: 0.0 },
    debug: {
        level: 0,
        file_level: {},
        mqtt: {},
        websocket: {},
        udp: {}
    },
    ui_data: {},
    rpc_udp: { dst_addr: '', listen_port: '' },
    sntp: { server: '' },
    cfg_rev: 0
}

export let VOID_SHELLY_SYSTEM_STATUS: ShellySystemStatus = {
    mac: '',
    restart_required: false,
    time: '',
    unixtime: 0,
    uptime: 0,
    ram_size: 0,
    ram_free: 0,
    fs_size: 0,
    fs_free: 0,
    cfg_rev: 0,
    kvs_rev: 0,
    schedule_rev: 0,
    webhook_rev: 0,
    available_updates: { stable: {} },
    reset_reason: 0
}

export let VOID_SHELLY_WIFI_CONFIG: ShellyWifiConfig = {
    ap: {
        ssid: '',
        is_open: true,
        enable: true,
        range_extender: {},
    },
    sta: {
        ssid: '',
        is_open: true,
        enable: true,
        ipv4mode: '',
        ip: {},
        netmask: {},
        gw: {},
        nameserver: {},
    },
    sta1: {
        ssid: '',
        is_open: true,
        enable: true,
        ipv4mode: '',
        ip: {},
        netmask: {},
        gw: {},
        nameserver: {},
    },
    roam: { rssi_thr: 0, interval: 0 }
}

export let VOID_SHELLY_WIFI_STATUS: ShellyWifiStatus = {
    sta_ip: '',
    status: '',
    ssid: '',
    rssi: 0
}

export let VOID_SHELLY_CLOUD_CONFIG: ShellyCloudConfig = { enable: true, server: '' }

export let VOID_SHELLY_CLOUD_STATUS: ShellyCloudStatus = { connected: false }

export let VOID_SHELLY_FAMILY: ShellyFamilyType = {
    id: 0,
    name: '',
    gen: '',
    config: {
        Humidity: {},
        MQTT: {},
        Input: {},
        Shelly: {},
        Switch: {},
        Sys: {},
        Cloud: {},
        WiFi: {},
        BLE: {},
        Matter: {},
        Temperature: {},
        Light: {},
        RGB: {},
        Cover: {},
        Presence: {},
        Illuminance: {}
    },
    status: {
        Humidity: {},
        MQTT: {},
        Input: {},
        Shelly: {},
        Switch: {},
        Sys: {},
        Cloud: {},
        WiFi: {},
        BLE: {},
        Matter: {},
        Temperature: {},
        Light: {},
        RGB: {},
        Cover: {},
        Presence: {},
        Illuminance: {}
    }
}

export let VOID_MATTER: MatterType = {
    id: 0,
    mode: '',
    nodeID: 0,
    fabricID: 0,
    endpiontIDs: [0],
    bridgeEndpiontIDs: [0]
}


export let VOID_DEVICE_TIPOLOGY: DeviceTipology = {
    id: 0,
    name: '',
    description: ''
}

export let VOID_DEVICE_CATEGORY: DeviceCategory = {
    id: 0,
    name: '',
    description: ''
}

export let VOID_ZONE: ZoneType = {
    id: 0,
    name: '',
    picture: ''
}

export let VOID_DEVICE: DeviceType = {
    id: 0,
    family: '',
    hardware: VOID_DEVICE_FAMILY,
    model: '',
    matter: VOID_MATTER,
    name: '',
    ip: '',
    mac: '',
    where: VOID_ZONE,
    onMap: '',
    description: '',
    signalStatus: 0,
    cloud: '',
    firmware: '',
    hostName: '',
    productName: '',
    updateAvailability: {},
    availability: '',
    catalogItemId: '',
    type: VOID_DEVICE_TIPOLOGY,
    category: VOID_DEVICE_CATEGORY,
    svgIcon: '',
    emoj: '',
    imgIcon: '',
    picture: '',
    channel: [''],
    status: [''],
    lastTime: ['']
}

export let VOID_ACTUATOR: ActuatorType = {...VOID_DEVICE}

export let VOID_SENSOR: SensorType = {
    ...VOID_DEVICE,
    unit: [''],
    value: [''],
    minThreshold: [''],
    maxThreshold: ['']
}

export let VOID_SENSOR_ACTUATOR: SensorActuatorType = {
    ...VOID_ACTUATOR,
    ...VOID_SENSOR
}

export let VOID_CLIMA: ClimaType = {
    ...VOID_ACTUATOR,
    mode: '',
    temperature: 0,
    fan: 0,
    airFlowVertical: 0,
    airFlowHorizontal: 0
}

export let VOID_SWITCH: SwitchType = {...VOID_ACTUATOR}

export let VOID_DIMMER: DimmerType = {...VOID_ACTUATOR}

export let VOID_CURTAIN: CurtainType = {
    ...VOID_ACTUATOR,
    movement: '',
    targetPosition: 0
}

export let VOID_TV: TVType = {
    ...VOID_ACTUATOR,
    volume: 0,
    input: 0,
    app: 0
}

export let VOID_METRED_SWITCH: MeteredSwitchType = {
    ...VOID_SENSOR_ACTUATOR
}

export let VOID_METRED_DIMMER: MeteredDimmerType = {
    ...VOID_SENSOR_ACTUATOR
}

export let VOID_METRED_CURTAIN: MeteredCurtainType = {
    ...VOID_SENSOR_ACTUATOR,
    ...VOID_CURTAIN
}

export let VOID_TERMOSTATE: TermostateType = {
    ...VOID_SENSOR_ACTUATOR,
    mode: '',
    temperature: 0
}

export let VOID_POWER_METER: PowerMeterType = {...VOID_SENSOR_ACTUATOR}


export let VOID_TEMPERATURE_HUMIDITY_SENSOR: TemperatureHumiditySensor = {...VOID_SENSOR}

export let VOID_LIGHT_SENSOR: LightSensor = {...VOID_SENSOR}

export let VOID_MOVEMENT_SENSOR: MovementSensor = {...VOID_SENSOR}

export let VOID_WATER_LEVEL_SENSOR: WaterLevelSensor = {...VOID_SENSOR}

export let VOID_BINARY_STATE_SENSOR: BinaryStateSensor = {...VOID_SENSOR}
