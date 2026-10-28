export type ScenarioTriggerType = {
    id: number;
    channel: {id: number; name: string; device?: number; };
    eventValueFrom: string | null;
    eventValueUpTo: string | null;
    eventValueAt: string | null;


}

// azione di uno scenario: comando (POWER:ON, SET:50, ...) sul canale del dispositivo; la PWA indica il canale con name
// (chiave del canale nel DeviceType), il Core ne ricava l'id di device_channels
export type ScenarioDeviceAction = {
    device: number;
    channel: {id: number; name: string; };
    action: string;
}

export type ScenarioType = {
    id: number;
    name: string;
    description: string;
    enabled: boolean;
    isImmediate: boolean;
    triggers: ScenarioTriggerType[];
    actions: ScenarioDeviceAction[];
}




// filtri della ricerca degli scenari (search-scenarios.sql)
export type ScenarioSearchParamsType = {
    idf?: number;
    idt?: number;
    ids?: number[];
    id?: number;
    name?: string;
    enabled?: number;
    pagesize?: number;
    pagenumber?: number;
    device_trigger?: number;
    device_action?: number;
    is_immediate?: number;
}
