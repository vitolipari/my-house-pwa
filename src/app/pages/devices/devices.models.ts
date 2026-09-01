export type DeviceProtocol = 'matter' | 'shelly' | 'tuya' | 'bluetooth' | 'remotenow' | 'manual';

export type DeviceCategoryId = 'ACTUATOR' | 'SENSOR' | 'SENSOR_ACTUATOR';

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
    device?: DiscoveredDevice;
    error?: string;
}


export type DevicePropertyKind = 'STATE' | 'SETTING' | 'MEASUREMENT';
export type DevicePropertyAccess = 'READ' | 'WRITE' | 'READ_WRITE';

// dallo schema -------------------------------------------------------------------------------------

export type DeviceFamilyType = {
    id: number | string;
    name: string;
    gen: string | number;
    config: any;
    status: any;
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
    gen: string | number;
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

export let VOID_DEVICE_FAMILY: DeviceFamilyType = {
    id: 0,
    name: 'no-name',
    gen: 0,
    config: {},
    status: {}
}

export let VOID_TUYA_FAMILY: TuyaFamilyType = {
    id: 0,
    name: 'no-name',
    gen: 0,
    localKey: 0,
    config: {},
    status: {}
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


/*

Ventola Studio Shelly 1 mini gen3
[
  {
    "id": 1,
    "family": "shelly",
    "hardware": {
      "id": "shelly1minig3-e4b063f06e4c",
      "name": "Shelly Mini 1 Gen3",
      "gen": "3",
      "config": {
        "Humidity": null,
        "MQTT": {
          "enable": true,
          "server": "192.168.1.34:1883",
          "client_id": "shelly1minig3-e4b063f06e4c",
          "user": "liparios-shelly",
          "ssl_ca": null,
          "topic_prefix": "liparios/devices/actuator/fan/shelly1minig3-e4b063f06e4c",
          "rpc_ntf": true,
          "status_ntf": true,
          "use_client_cert": false,
          "enable_rpc": false,
          "enable_control": false
        },
        "Input": {
          "id": 0,
          "name": "Areazione studio",
          "type": "switch",
          "enable": true,
          "invert": false,
          "factory_reset": true
        },
        "Shelly": {
          "ble": {
            "rpc": {
              "enable": false
            }
          },
          "bthome": {},
          "cloud": {
            "enable": true,
            "server": "shelly-172-eu.shelly.cloud:6022/jrpc"
          },
          "input:0": {
            "id": 0,
            "name": "Areazione studio",
            "type": "switch",
            "enable": true,
            "invert": false,
            "factory_reset": true
          },
          "knx": {
            "enable": false,
            "ia": "15.15.255",
            "routing": {
              "addr": "224.0.23.12:3671"
            }
          },
          "matter": {
            "enable": false
          },
          "mqtt": {
            "enable": true,
            "server": "192.168.1.34:1883",
            "client_id": "shelly1minig3-e4b063f06e4c",
            "user": "liparios-shelly",
            "ssl_ca": null,
            "topic_prefix": "liparios/devices/actuator/fan/shelly1minig3-e4b063f06e4c",
            "rpc_ntf": true,
            "status_ntf": true,
            "use_client_cert": false,
            "enable_rpc": false,
            "enable_control": false
          },
          "switch:0": {
            "id": 0,
            "name": "Areazione studio",
            "in_mode": "follow",
            "in_locked": false,
            "initial_state": "match_input",
            "auto_on": false,
            "auto_on_delay": 60,
            "auto_off": false,
            "auto_off_delay": 60,
            "counts": {
              "enable": true
            }
          },
          "sys": {
            "device": {
              "name": null,
              "mac": "E4B063F06E4C",
              "fw_id": "20260710-101122/2.0.0-g87fbfa4",
              "discoverable": true,
              "eco_mode": false,
              "tls_check_cert_validity_time": true,
              "enhanced_security": false
            },
            "location": {
              "tz": "Europe/Rome",
              "lat": 37.645021,
              "lon": 12.611367
            },
            "debug": {
              "level": 2,
              "file_level": null,
              "mqtt": {
                "enable": false
              },
              "websocket": {
                "enable": false
              },
              "file_log": {
                "enable": false
              },
              "udp": {
                "addr": null
              }
            },
            "ui_data": {},
            "rpc_udp": {
              "dst_addr": null,
              "listen_port": null
            },
            "sntp": {
              "server": "time.cloudflare.com"
            },
            "cfg_rev": 20
          },
          "wifi": {
            "ap": {
              "ssid": "Shelly1MiniG3-E4B063F06E4C",
              "is_open": true,
              "enable": false,
              "range_extender": {
                "enable": false
              }
            },
            "sta": {
              "ssid": "TIM-37999422",
              "is_open": false,
              "enable": true,
              "ipv4mode": "dhcp",
              "ip": null,
              "netmask": null,
              "gw": null,
              "nameserver": null
            },
            "sta1": {
              "ssid": null,
              "is_open": true,
              "enable": false,
              "ipv4mode": "dhcp",
              "ip": null,
              "netmask": null,
              "gw": null,
              "nameserver": null
            },
            "roam": {
              "rssi_thr": -80,
              "interval": 60
            }
          },
          "ws": {
            "enable": false,
            "server": null,
            "ssl_ca": "ca.pem"
          }
        },
        "Switch": {
          "id": 0,
          "name": "Areazione studio",
          "in_mode": "follow",
          "in_locked": false,
          "initial_state": "match_input",
          "auto_on": false,
          "auto_on_delay": 60,
          "auto_off": false,
          "auto_off_delay": 60,
          "counts": {
            "enable": true
          }
        },
        "Sys": {
          "device": {
            "name": null,
            "mac": "E4B063F06E4C",
            "fw_id": "20260710-101122/2.0.0-g87fbfa4",
            "discoverable": true,
            "eco_mode": false,
            "tls_check_cert_validity_time": true,
            "enhanced_security": false
          },
          "location": {
            "tz": "Europe/Rome",
            "lat": 37.645021,
            "lon": 12.611367
          },
          "debug": {
            "level": 2,
            "file_level": null,
            "mqtt": {
              "enable": false
            },
            "websocket": {
              "enable": false
            },
            "file_log": {
              "enable": false
            },
            "udp": {
              "addr": null
            }
          },
          "ui_data": {},
          "rpc_udp": {
            "dst_addr": null,
            "listen_port": null
          },
          "sntp": {
            "server": "time.cloudflare.com"
          },
          "cfg_rev": 20
        },
        "Cloud": {
          "enable": true,
          "server": "shelly-172-eu.shelly.cloud:6022/jrpc"
        },
        "WiFi": {
          "ap": {
            "ssid": "Shelly1MiniG3-E4B063F06E4C",
            "is_open": true,
            "enable": false,
            "range_extender": {
              "enable": false
            }
          },
          "sta": {
            "ssid": "TIM-37999422",
            "is_open": false,
            "enable": true,
            "ipv4mode": "dhcp",
            "ip": null,
            "netmask": null,
            "gw": null,
            "nameserver": null
          },
          "sta1": {
            "ssid": null,
            "is_open": true,
            "enable": false,
            "ipv4mode": "dhcp",
            "ip": null,
            "netmask": null,
            "gw": null,
            "nameserver": null
          },
          "roam": {
            "rssi_thr": -80,
            "interval": 60
          }
        },
        "BLE": {
          "rpc": {
            "enable": false
          }
        },
        "Matter": {
          "enable": false
        },
        "Temperature": null,
        "Light": null,
        "RGB": null,
        "Cover": null,
        "Presence": null,
        "Illuminance": null
      },
      "status": {
        "Humidity": null,
        "MQTT": {
          "connected": true
        },
        "Input": {
          "id": 0,
          "state": false
        },
        "Shelly": {
          "ble": {},
          "bthome": {},
          "cloud": {
            "connected": true
          },
          "input:0": {
            "id": 0,
            "state": false
          },
          "knx": {},
          "matter": {
            "num_fabrics": 0,
            "commissionable": false
          },
          "mqtt": {
            "connected": true
          },
          "switch:0": {
            "id": 0,
            "source": "switch",
            "tag": null,
            "output": false,
            "counts": {
              "on_time": 15390,
              "on_time_rst_ts": 0,
              "switch_on": 11,
              "switch_on_rst_ts": 0
            },
            "temperature": {
              "tC": 59.4,
              "tF": 138.9
            }
          },
          "sys": {
            "mac": "E4B063F06E4C",
            "restart_required": false,
            "time": "15:01",
            "unixtime": 1787922066,
            "last_sync_ts": 1787920861,
            "uptime": 186097,
            "ram_size": 275920,
            "ram_free": 135360,
            "ram_min_free": 119856,
            "fs_size": 917504,
            "fs_free": 450560,
            "cfg_rev": 20,
            "kvs_rev": 0,
            "schedule_rev": 1,
            "webhook_rev": 0,
            "btrelay_rev": 0,
            "bthc_rev": 0,
            "available_updates": {
              "beta": {
                "version": "2.0.1-beta1"
              }
            },
            "reset_reason": 3,
            "utc_offset": 7200
          },
          "wifi": {
            "sta_ip": "192.168.1.46",
            "status": "got ip",
            "ssid": "TIM-37999422",
            "channel": 9,
            "rssi": -64,
            "bssid": "f4:fc:49:08:ef:cc",
            "sta_ip6": [
              "fe80::e6b0:63ff:fef0:6e4c"
            ]
          },
          "ws": {
            "connected": false
          }
        },
        "Switch": {
          "id": 0,
          "source": "switch",
          "tag": null,
          "output": false,
          "counts": {
            "on_time": 15390,
            "on_time_rst_ts": 0,
            "switch_on": 11,
            "switch_on_rst_ts": 0
          },
          "temperature": {
            "tC": 59.4,
            "tF": 138.9
          }
        },
        "Sys": {
          "mac": "E4B063F06E4C",
          "restart_required": false,
          "time": "15:01",
          "unixtime": 1787922066,
          "last_sync_ts": 1787920861,
          "uptime": 186097,
          "ram_size": 275920,
          "ram_free": 135360,
          "ram_min_free": 119856,
          "fs_size": 917504,
          "fs_free": 450560,
          "cfg_rev": 20,
          "kvs_rev": 0,
          "schedule_rev": 1,
          "webhook_rev": 0,
          "btrelay_rev": 0,
          "bthc_rev": 0,
          "available_updates": {
            "beta": {
              "version": "2.0.1-beta1"
            }
          },
          "reset_reason": 3,
          "utc_offset": 7200
        },
        "Cloud": {
          "connected": true
        },
        "WiFi": {
          "sta_ip": "192.168.1.46",
          "status": "got ip",
          "ssid": "TIM-37999422",
          "channel": 9,
          "rssi": -64,
          "bssid": "f4:fc:49:08:ef:cc",
          "sta_ip6": [
            "fe80::e6b0:63ff:fef0:6e4c"
          ]
        },
        "BLE": {},
        "Matter": {
          "num_fabrics": 0,
          "commissionable": false
        },
        "Temperature": null,
        "Light": null,
        "RGB": null,
        "Cover": null,
        "Presence": null,
        "Illuminance": null
      },
      "lastReadAt": "2026-08-28T13:01:06.471Z"
    },
    "model": "S3SW-001X8EU",
    "matter": {
      "id": 0,
      "mode": "",
      "nodeID": 0,
      "fabricID": 0,
      "endpiontIDs": [],
      "bridgeEndpiontIDs": []
    },
    "name": "Ventola Studio",
    "ip": "192.168.1.46",
    "mac": "E4:B0:63:F0:6E:4C",
    "where": {
      "id": 0,
      "name": "",
      "picture": ""
    },
    "onMap": "",
    "description": "",
    "signalStatus": 0,
    "cloud": "",
    "firmware": "2.0.0",
    "updateAvailability": {},
    "productName": "Shelly Mini 1 Gen3",
    "hostName": "shelly1minig3-e4b063f06e4c",
    "availability": "ONLINE",
    "catalogItemId": "FAN",
    "type": {
      "id": "SWITCH",
      "name": "Interruttore ON/OFF",
      "description": "Comando ON/OFF senza misure sensoriali"
    },
    "category": {
      "id": "ACTUATOR",
      "name": "Attuatore",
      "description": "Riceve comandi e modifica lo stato del dispositivo o dell ambiente"
    },
    "svgIcon": "fan_04",
    "emoj": "tornado",
    "imgIcon": "",
    "picture": "",
    "channel": [
      "output",
      "power",
      "energy"
    ],
    "status": [
      null,
      null,
      null
    ],
    "lastTime": [
      null,
      null,
      null
    ]
  },
  {
    "id": 2,
    "family": "shelly",
    "hardware": {
      "id": "shelly1pmminig4-e4b0636a5738",
      "name": "Shelly Mini 1PM Gen4",
      "gen": "4",
      "config": {
        "Humidity": null,
        "MQTT": {
          "enable": true,
          "server": "192.168.1.34:1883",
          "client_id": "shelly1pmminig4-e4b0636a5738",
          "user": "liparios-shelly",
          "ssl_ca": null,
          "topic_prefix": "liparios/devices/actuator/light/shelly1pmminig4-e4b0636a5738",
          "rpc_ntf": true,
          "status_ntf": true,
          "use_client_cert": false,
          "enable_rpc": false,
          "enable_control": false
        },
        "Input": {
          "id": 0,
          "name": null,
          "type": "switch",
          "enable": true,
          "invert": false,
          "factory_reset": true
        },
        "Shelly": {
          "ble": {
            "enable": false,
            "rpc": {
              "enable": true
            }
          },
          "bthome": {},
          "cloud": {
            "enable": true,
            "server": "shelly-172-eu.shelly.cloud:6022/jrpc"
          },
          "input:0": {
            "id": 0,
            "name": null,
            "type": "switch",
            "enable": true,
            "invert": false,
            "factory_reset": true
          },
          "knx": {
            "enable": false,
            "ia": "15.15.255",
            "routing": {
              "addr": "224.0.23.12:3671"
            }
          },
          "matter": {
            "enable": true
          },
          "mqtt": {
            "enable": true,
            "server": "192.168.1.34:1883",
            "client_id": "shelly1pmminig4-e4b0636a5738",
            "user": "liparios-shelly",
            "ssl_ca": null,
            "topic_prefix": "liparios/devices/actuator/light/shelly1pmminig4-e4b0636a5738",
            "rpc_ntf": true,
            "status_ntf": true,
            "use_client_cert": false,
            "enable_rpc": false,
            "enable_control": false
          },
          "switch:0": {
            "id": 0,
            "name": null,
            "in_mode": "follow",
            "in_locked": false,
            "initial_state": "match_input",
            "auto_on": false,
            "auto_on_delay": 60,
            "auto_off": false,
            "auto_off_delay": 60,
            "power_limit": 2240,
            "voltage_limit": 280,
            "autorecover_voltage_errors": false,
            "current_limit": 8,
            "reverse": false
          },
          "sys": {
            "device": {
              "name": null,
              "mac": "E4B0636A5738",
              "fw_id": "20250214-121727/1.5.99-g4prod1-gc32c24b",
              "discoverable": true,
              "eco_mode": false
            },
            "location": {
              "tz": "Europe/Rome",
              "lat": 38.1302,
              "lon": 13.329
            },
            "debug": {
              "level": 2,
              "file_level": null,
              "mqtt": {
                "enable": false
              },
              "websocket": {
                "enable": false
              },
              "udp": {
                "addr": null
              }
            },
            "ui_data": {},
            "rpc_udp": {
              "dst_addr": null,
              "listen_port": null
            },
            "sntp": {
              "server": "time.cloudflare.com"
            },
            "cfg_rev": 18
          },
          "wifi": {
            "ap": {
              "ssid": "Shelly1PMMiniG4-E4B0636A5738",
              "is_open": true,
              "enable": false,
              "range_extender": {
                "enable": false
              }
            },
            "sta": {
              "ssid": "TIM-37999422",
              "is_open": false,
              "enable": true,
              "ipv4mode": "dhcp",
              "ip": null,
              "netmask": null,
              "gw": null,
              "nameserver": null
            },
            "sta1": {
              "ssid": null,
              "is_open": true,
              "enable": false,
              "ipv4mode": "dhcp",
              "ip": null,
              "netmask": null,
              "gw": null,
              "nameserver": null
            },
            "roam": {
              "rssi_thr": -80,
              "interval": 60
            }
          },
          "ws": {
            "enable": false,
            "server": null,
            "ssl_ca": "ca.pem"
          }
        },
        "Switch": {
          "id": 0,
          "name": null,
          "in_mode": "follow",
          "in_locked": false,
          "initial_state": "match_input",
          "auto_on": false,
          "auto_on_delay": 60,
          "auto_off": false,
          "auto_off_delay": 60,
          "power_limit": 2240,
          "voltage_limit": 280,
          "autorecover_voltage_errors": false,
          "current_limit": 8,
          "reverse": false
        },
        "Sys": {
          "device": {
            "name": null,
            "mac": "E4B0636A5738",
            "fw_id": "20250214-121727/1.5.99-g4prod1-gc32c24b",
            "discoverable": true,
            "eco_mode": false
          },
          "location": {
            "tz": "Europe/Rome",
            "lat": 38.1302,
            "lon": 13.329
          },
          "debug": {
            "level": 2,
            "file_level": null,
            "mqtt": {
              "enable": false
            },
            "websocket": {
              "enable": false
            },
            "udp": {
              "addr": null
            }
          },
          "ui_data": {},
          "rpc_udp": {
            "dst_addr": null,
            "listen_port": null
          },
          "sntp": {
            "server": "time.cloudflare.com"
          },
          "cfg_rev": 18
        },
        "Cloud": {
          "enable": true,
          "server": "shelly-172-eu.shelly.cloud:6022/jrpc"
        },
        "WiFi": {
          "ap": {
            "ssid": "Shelly1PMMiniG4-E4B0636A5738",
            "is_open": true,
            "enable": false,
            "range_extender": {
              "enable": false
            }
          },
          "sta": {
            "ssid": "TIM-37999422",
            "is_open": false,
            "enable": true,
            "ipv4mode": "dhcp",
            "ip": null,
            "netmask": null,
            "gw": null,
            "nameserver": null
          },
          "sta1": {
            "ssid": null,
            "is_open": true,
            "enable": false,
            "ipv4mode": "dhcp",
            "ip": null,
            "netmask": null,
            "gw": null,
            "nameserver": null
          },
          "roam": {
            "rssi_thr": -80,
            "interval": 60
          }
        },
        "BLE": {
          "enable": false,
          "rpc": {
            "enable": true
          }
        },
        "Matter": {
          "enable": true
        },
        "Temperature": null,
        "Light": null,
        "RGB": null,
        "Cover": null,
        "Presence": null,
        "Illuminance": null
      },
      "status": {
        "Humidity": null,
        "MQTT": {
          "connected": true
        },
        "Input": {
          "id": 0,
          "state": false
        },
        "Shelly": {
          "ble": {},
          "bthome": {
            "errors": [
              "bluetooth_disabled"
            ]
          },
          "cloud": {
            "connected": true
          },
          "input:0": {
            "id": 0,
            "state": false
          },
          "knx": {},
          "matter": {
            "num_fabrics": 0,
            "commissionable": false
          },
          "mqtt": {
            "connected": true
          },
          "switch:0": {
            "id": 0,
            "source": "switch",
            "output": false,
            "apower": 0,
            "voltage": 233.3,
            "freq": 50.1,
            "current": 0,
            "aenergy": {
              "total": 7784,
              "by_minute": [
                0,
                0,
                0
              ],
              "minute_ts": 1787922060
            },
            "ret_aenergy": {
              "total": 0,
              "by_minute": [
                0,
                0,
                0
              ],
              "minute_ts": 1787922060
            },
            "temperature": {
              "tC": 61.8,
              "tF": 143.3
            }
          },
          "sys": {
            "mac": "E4B0636A5738",
            "restart_required": false,
            "time": "15:01",
            "unixtime": 1787922066,
            "last_sync_ts": 1787922051,
            "uptime": 79039,
            "ram_size": 361164,
            "ram_free": 191220,
            "ram_min_free": 170368,
            "fs_size": 917504,
            "fs_free": 471040,
            "cfg_rev": 18,
            "kvs_rev": 0,
            "schedule_rev": 0,
            "webhook_rev": 0,
            "btrelay_rev": 0,
            "available_updates": {
              "beta": {
                "version": "2.0.1-beta1"
              },
              "stable": {
                "version": "2.0.0"
              }
            },
            "alt": {
              "Mini1PMG4ZB": {
                "name": "Shelly Mini 1 PM Gen4",
                "desc": "Shelly Mini 1 PM Gen4 with Zigbee",
                "beta": {
                  "version": "2.0.1-beta1",
                  "build_id": "20260819-101729/2.0.1-beta1-g8a88c73"
                },
                "stable": {
                  "version": "2.0.0",
                  "build_id": "20260710-101116/2.0.0-g87fbfa4"
                }
              }
            },
            "reset_reason": 4,
            "utc_offset": 7200
          },
          "wifi": {
            "sta_ip": "192.168.1.14",
            "status": "got ip",
            "ssid": "TIM-37999422",
            "rssi": -55
          },
          "ws": {
            "connected": false
          }
        },
        "Switch": {
          "id": 0,
          "source": "switch",
          "output": false,
          "apower": 0,
          "voltage": 233.3,
          "freq": 50.1,
          "current": 0,
          "aenergy": {
            "total": 7784,
            "by_minute": [
              0,
              0,
              0
            ],
            "minute_ts": 1787922060
          },
          "ret_aenergy": {
            "total": 0,
            "by_minute": [
              0,
              0,
              0
            ],
            "minute_ts": 1787922060
          },
          "temperature": {
            "tC": 61.8,
            "tF": 143.3
          }
        },
        "Sys": {
          "mac": "E4B0636A5738",
          "restart_required": false,
          "time": "15:01",
          "unixtime": 1787922066,
          "last_sync_ts": 1787922051,
          "uptime": 79039,
          "ram_size": 361164,
          "ram_free": 191220,
          "ram_min_free": 170368,
          "fs_size": 917504,
          "fs_free": 471040,
          "cfg_rev": 18,
          "kvs_rev": 0,
          "schedule_rev": 0,
          "webhook_rev": 0,
          "btrelay_rev": 0,
          "available_updates": {
            "beta": {
              "version": "2.0.1-beta1"
            },
            "stable": {
              "version": "2.0.0"
            }
          },
          "alt": {
            "Mini1PMG4ZB": {
              "name": "Shelly Mini 1 PM Gen4",
              "desc": "Shelly Mini 1 PM Gen4 with Zigbee",
              "beta": {
                "version": "2.0.1-beta1",
                "build_id": "20260819-101729/2.0.1-beta1-g8a88c73"
              },
              "stable": {
                "version": "2.0.0",
                "build_id": "20260710-101116/2.0.0-g87fbfa4"
              }
            }
          },
          "reset_reason": 4,
          "utc_offset": 7200
        },
        "Cloud": {
          "connected": true
        },
        "WiFi": {
          "sta_ip": "192.168.1.14",
          "status": "got ip",
          "ssid": "TIM-37999422",
          "rssi": -55
        },
        "BLE": {},
        "Matter": {
          "num_fabrics": 0,
          "commissionable": false
        },
        "Temperature": null,
        "Light": null,
        "RGB": null,
        "Cover": null,
        "Presence": null,
        "Illuminance": null
      },
      "lastReadAt": "2026-08-28T13:01:06.155Z"
    },
    "model": "S4SW-001P8EU",
    "matter": {
      "id": 0,
      "mode": "",
      "nodeID": 0,
      "fabricID": 0,
      "endpiontIDs": [],
      "bridgeEndpiontIDs": []
    },
    "name": "Faretti Cucina",
    "ip": "192.168.1.14",
    "mac": "E4:B0:63:6A:57:38",
    "where": {
      "id": 0,
      "name": "",
      "picture": ""
    },
    "onMap": "",
    "description": "",
    "signalStatus": 0,
    "cloud": "",
    "firmware": "1.5.99-g4prod1",
    "updateAvailability": {},
    "productName": "Shelly Mini 1PM Gen4",
    "hostName": "shelly1pmminig4-e4b0636a5738",
    "availability": "ONLINE",
    "catalogItemId": "LAMP",
    "type": {
      "id": "METERED_SWITCH",
      "name": "Interruttore ON/OFF con misura",
      "description": "Comando ON/OFF e misura della potenza o energia"
    },
    "category": {
      "id": "SENSOR_ACTUATOR",
      "name": "Sensore e attuatore",
      "description": "Produce misure e riceve comandi funzionali"
    },
    "svgIcon": "icon-325",
    "emoj": "light_bulb",
    "imgIcon": "",
    "picture": "",
    "channel": [
      "output",
      "power",
      "energy"
    ],
    "status": [
      null,
      null,
      null
    ],
    "lastTime": [
      null,
      null,
      null
    ],
    "unit": [
      "",
      "W",
      "Wh"
    ],
    "value": [
      null,
      null,
      null
    ],
    "minThreshold": [
      null,
      null,
      null
    ],
    "maxThreshold": [
      null,
      null,
      null
    ]
  },
  {
  "id": 3,
  "family": "shelly",
  "hardware": {
    "id": "shelly1pmminig4-e4b063774e2c",
    "name": "",
    "gen": 4,
    "config": {
      "Humidity": null,
      "MQTT": {
        "enable": true,
        "server": "192.168.1.34:1883",
        "client_id": "shelly1pmminig4-e4b063774e2c",
        "user": "liparios-shelly",
        "ssl_ca": null,
        "topic_prefix": "liparios/devices/actuator/light/shelly1pmminig4-e4b063774e2c",
        "rpc_ntf": true,
        "status_ntf": true,
        "use_client_cert": false,
        "enable_rpc": false,
        "enable_control": false
      },
      "Input": {
        "id": 0,
        "name": null,
        "type": "switch",
        "enable": true,
        "invert": false,
        "factory_reset": true
      },
      "Shelly": {
        "ble": {
          "enable": true,
          "rpc": {
            "enable": true
          }
        },
        "bthome": {},
        "cloud": {
          "enable": true,
          "server": "shelly-172-eu.shelly.cloud:6022/jrpc"
        },
        "input:0": {
          "id": 0,
          "name": null,
          "type": "switch",
          "enable": true,
          "invert": false,
          "factory_reset": true
        },
        "knx": {
          "enable": false,
          "ia": "15.15.255",
          "routing": {
            "addr": "224.0.23.12:3671"
          }
        },
        "matter": {
          "enable": true
        },
        "mqtt": {
          "enable": false,
          "server": null,
          "client_id": "shelly1pmminig4-e4b063774e2c",
          "user": null,
          "ssl_ca": null,
          "topic_prefix": "shelly1pmminig4-e4b063774e2c",
          "rpc_ntf": true,
          "status_ntf": false,
          "use_client_cert": false,
          "enable_rpc": true,
          "enable_control": true
        },
        "switch:0": {
          "id": 0,
          "name": null,
          "in_mode": "follow",
          "in_locked": false,
          "initial_state": "match_input",
          "auto_on": false,
          "auto_on_delay": 60,
          "auto_off": false,
          "auto_off_delay": 60,
          "power_limit": 2240,
          "voltage_limit": 280,
          "autorecover_voltage_errors": false,
          "current_limit": 8,
          "reverse": false
        },
        "sys": {
          "device": {
            "name": null,
            "mac": "E4B063774E2C",
            "fw_id": "20250214-121727/1.5.99-g4prod1-gc32c24b",
            "discoverable": true,
            "eco_mode": false
          },
          "location": {
            "tz": "Europe/Rome",
            "lat": 38.1302,
            "lon": 13.329
          },
          "debug": {
            "level": 2,
            "file_level": null,
            "mqtt": {
              "enable": false
            },
            "websocket": {
              "enable": false
            },
            "udp": {
              "addr": null
            }
          },
          "ui_data": {},
          "rpc_udp": {
            "dst_addr": null,
            "listen_port": null
          },
          "sntp": {
            "server": "time.cloudflare.com"
          },
          "cfg_rev": 14
        },
        "wifi": {
          "ap": {
            "ssid": "Shelly1PMMiniG4-E4B063774E2C",
            "is_open": true,
            "enable": true,
            "range_extender": {
              "enable": false
            }
          },
          "sta": {
            "ssid": "TIM-37999422",
            "is_open": false,
            "enable": true,
            "ipv4mode": "dhcp",
            "ip": null,
            "netmask": null,
            "gw": null,
            "nameserver": null
          },
          "sta1": {
            "ssid": null,
            "is_open": true,
            "enable": false,
            "ipv4mode": "dhcp",
            "ip": null,
            "netmask": null,
            "gw": null,
            "nameserver": null
          },
          "roam": {
            "rssi_thr": -80,
            "interval": 60
          }
        },
        "ws": {
          "enable": false,
          "server": null,
          "ssl_ca": "ca.pem"
        }
      },
      "Switch": {
        "id": 0,
        "name": null,
        "in_mode": "follow",
        "in_locked": false,
        "initial_state": "match_input",
        "auto_on": false,
        "auto_on_delay": 60,
        "auto_off": false,
        "auto_off_delay": 60,
        "power_limit": 2240,
        "voltage_limit": 280,
        "autorecover_voltage_errors": false,
        "current_limit": 8,
        "reverse": false
      },
      "Sys": {
        "device": {
          "name": null,
          "mac": "E4B063774E2C",
          "fw_id": "20250214-121727/1.5.99-g4prod1-gc32c24b",
          "discoverable": true,
          "eco_mode": false
        },
        "location": {
          "tz": "Europe/Rome",
          "lat": 38.1302,
          "lon": 13.329
        },
        "debug": {
          "level": 2,
          "file_level": null,
          "mqtt": {
            "enable": false
          },
          "websocket": {
            "enable": false
          },
          "udp": {
            "addr": null
          }
        },
        "ui_data": {},
        "rpc_udp": {
          "dst_addr": null,
          "listen_port": null
        },
        "sntp": {
          "server": "time.cloudflare.com"
        },
        "cfg_rev": 14
      },
      "Cloud": {
        "enable": true,
        "server": "shelly-172-eu.shelly.cloud:6022/jrpc"
      },
      "WiFi": {
        "ap": {
          "ssid": "Shelly1PMMiniG4-E4B063774E2C",
          "is_open": true,
          "enable": true,
          "range_extender": {
            "enable": false
          }
        },
        "sta": {
          "ssid": "TIM-37999422",
          "is_open": false,
          "enable": true,
          "ipv4mode": "dhcp",
          "ip": null,
          "netmask": null,
          "gw": null,
          "nameserver": null
        },
        "sta1": {
          "ssid": null,
          "is_open": true,
          "enable": false,
          "ipv4mode": "dhcp",
          "ip": null,
          "netmask": null,
          "gw": null,
          "nameserver": null
        },
        "roam": {
          "rssi_thr": -80,
          "interval": 60
        }
      },
      "BLE": {
        "enable": true,
        "rpc": {
          "enable": true
        }
      },
      "Matter": {
        "enable": true
      },
      "Temperature": null,
      "Light": null,
      "RGB": null,
      "Cover": null,
      "Presence": null,
      "Illuminance": null
    },
    "status": {
      "Humidity": null,
      "MQTT": {
        "connected": true
      },
      "Input": {
        "id": 0,
        "state": false
      },
      "Shelly": {
        "ble": {},
        "bthome": {},
        "cloud": {
          "connected": true
        },
        "input:0": {
          "id": 0,
          "state": false
        },
        "knx": {},
        "matter": {
          "num_fabrics": 0,
          "commissionable": false
        },
        "mqtt": {
          "connected": false
        },
        "switch:0": {
          "id": 0,
          "source": "switch",
          "output": false,
          "apower": 0,
          "voltage": 233.7,
          "freq": 50.1,
          "current": 0,
          "aenergy": {
            "total": 3104.561,
            "by_minute": [
              0,
              0,
              0
            ],
            "minute_ts": 1787925180
          },
          "ret_aenergy": {
            "total": 0,
            "by_minute": [
              0,
              0,
              0
            ],
            "minute_ts": 1787925180
          },
          "temperature": {
            "tC": 69.6,
            "tF": 157.3
          }
        },
        "sys": {
          "mac": "E4B063774E2C",
          "restart_required": false,
          "time": "15:53",
          "unixtime": 1787925185,
          "last_sync_ts": 1787924243,
          "uptime": 2824775,
          "ram_size": 358264,
          "ram_free": 91992,
          "ram_min_free": 85088,
          "fs_size": 917504,
          "fs_free": 471040,
          "cfg_rev": 14,
          "kvs_rev": 0,
          "schedule_rev": 0,
          "webhook_rev": 0,
          "btrelay_rev": 0,
          "available_updates": {
            "beta": {
              "version": "2.0.1-beta1"
            },
            "stable": {
              "version": "2.0.0"
            }
          },
          "alt": {
            "Mini1PMG4ZB": {
              "name": "Shelly Mini 1 PM Gen4",
              "desc": "Shelly Mini 1 PM Gen4 with Zigbee",
              "beta": {
                "version": "2.0.1-beta1",
                "build_id": "20260819-101729/2.0.1-beta1-g8a88c73"
              },
              "stable": {
                "version": "2.0.0",
                "build_id": "20260710-101116/2.0.0-g87fbfa4"
              }
            }
          },
          "reset_reason": 1,
          "utc_offset": 7200
        },
        "wifi": {
          "sta_ip": "192.168.1.35",
          "status": "got ip",
          "ssid": "TIM-37999422",
          "rssi": -41
        },
        "ws": {
          "connected": false
        }
      },
      "Switch": {
        "id": 0,
        "source": "switch",
        "output": false,
        "apower": 0,
        "voltage": 233.7,
        "freq": 50.1,
        "current": 0,
        "aenergy": {
          "total": 3104.561,
          "by_minute": [
            0,
            0,
            0
          ],
          "minute_ts": 1787925180
        },
        "ret_aenergy": {
          "total": 0,
          "by_minute": [
            0,
            0,
            0
          ],
          "minute_ts": 1787925180
        },
        "temperature": {
          "tC": 69.6,
          "tF": 157.3
        }
      },
      "Sys": {
        "mac": "E4B063774E2C",
        "restart_required": false,
        "time": "15:53",
        "unixtime": 1787925185,
        "last_sync_ts": 1787924243,
        "uptime": 2824775,
        "ram_size": 358264,
        "ram_free": 91992,
        "ram_min_free": 85088,
        "fs_size": 917504,
        "fs_free": 471040,
        "cfg_rev": 14,
        "kvs_rev": 0,
        "schedule_rev": 0,
        "webhook_rev": 0,
        "btrelay_rev": 0,
        "available_updates": {
          "beta": {
            "version": "2.0.1-beta1"
          },
          "stable": {
            "version": "2.0.0"
          }
        },
        "alt": {
          "Mini1PMG4ZB": {
            "name": "Shelly Mini 1 PM Gen4",
            "desc": "Shelly Mini 1 PM Gen4 with Zigbee",
            "beta": {
              "version": "2.0.1-beta1",
              "build_id": "20260819-101729/2.0.1-beta1-g8a88c73"
            },
            "stable": {
              "version": "2.0.0",
              "build_id": "20260710-101116/2.0.0-g87fbfa4"
            }
          }
        },
        "reset_reason": 1,
        "utc_offset": 7200
      },
      "Cloud": {
        "connected": true
      },
      "WiFi": {
        "sta_ip": "192.168.1.35",
        "status": "got ip",
        "ssid": "TIM-37999422",
        "rssi": -41
      },
      "BLE": {},
      "Matter": {
        "num_fabrics": 0,
        "commissionable": false
      },
      "Temperature": null,
      "Light": null,
      "RGB": null,
      "Cover": null,
      "Presence": null,
      "Illuminance": null
    },
    "model": "S4SW-001P8EU",
    "lastReadAt": "2026-08-28T13:53:05.747Z"
  },
  "model": "S4SW-001P8EU",
  "matter": {
    "id": 0,
    "mode": "",
    "nodeID": 0,
    "fabricID": 0,
    "endpiontIDs": [
      0
    ],
    "bridgeEndpiontIDs": [
      0
    ]
  },
  "name": "Lampada Tavolo Cucina",
  "ip": "192.168.1.35",
  "mac": "E4:B0:63:77:4E:2C",
  "where": {
    "id": 0,
    "name": "",
    "picture": ""
  },
  "onMap": "",
  "description": "",
  "signalStatus": 0,
  "cloud": "",
  "firmware": "1.5.99-g4prod1",
  "hostName": "shelly1pmminig4-e4b063774e2c",
  "productName": "Shelly Mini 1PM Gen4",
  "updateAvailability": {},
  "availability": "",
  "catalogItemId": "LAMP",
  "type": {
    "id": "METERED_SWITCH",
    "name": "Interruttore ON/OFF con misura",
    "description": "Comando ON/OFF e misura della potenza o energia"
  },
  "category": {
    "id": "SENSOR_ACTUATOR",
    "name": "Sensore e attuatore",
    "description": "Produce misure e riceve comandi funzionali"
  },
  "svgIcon": "icon-325",
  "emoj": "light_bulb",
  "imgIcon": "",
  "picture": "",
  "channel": [
    ""
  ],
  "status": [
    ""
  ],
  "lastTime": [
    ""
  ],
  "unit": [
    ""
  ],
  "value": [
    ""
  ],
  "minThreshold": [
    ""
  ],
  "maxThreshold": [
    ""
  ]
}
]
 */


export type DeviceSmallType = {
    id: number | string;
    family: string;
    name: string;
    ip: string;
    mac: string;
    where: ZoneType;
    signalStatus: number;
    catalogItemId: string;
    type: DeviceTipology;
    category: DeviceCategory;
    svgIcon: string;
    emoj: string;
    imgIcon: string;
    channel: string[];
    status: Array<number | string | boolean | null>;
    lastTime: Array<number | string | null>;
}

