
export type ScenarioType = {
    id: number;
    name: string;
    description: string;
    enabled: boolean;
    isImmediate: boolean;
    triggers: EventTriggerChannelDeviceType[];
    actions: ActionChannelDeviceType[];
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


export type EventTriggerChannelDeviceType = {
    id: number;
    device: number;
    name: string;
    isOwned: boolean;
    channel: string;
    deviceEmojIcon: string;
    channelSvgIcon: string;
    channelUnit: string;
    channelType: string;
    room: string;
    valueBy?: number | string | null
    valueUpTo?: number | string | null
    valueAt?: number | string | null
};

export type ActionChannelDeviceType = {
    id: number;
    device: number;
    name: string;
    isOwned: boolean;
    deviceEmojIcon: string;
    channelSvgIcon: string;
    channelUnit: string;
    channelType: string;
    room: string;
    channel: string;
    value: number | string | boolean;
    // secondi prima del comando e prima del ritorno allo stato di prima, letti dal comando del Core in modifica
    delay?: number;
    duration?: number;
}


// valori di un'azione letti dal comando del Core (POWER:ON;delay=30;duration=60): booleano per POWER, testo per SET
export type ScenarioActionValuesType = {
    value: boolean | string;
    delay: number;
    duration: number;
};


export type ScenarioDTOType = {
    "id": number;
    "name": string;
    "description": string;
    "enabled": boolean;
    "isImmediate": boolean;
    "triggers":
        {
            "device": number;
            "valueAt": number | string | boolean | null;
            "valueBy": number | string | boolean | null;
            "valueUpTo": number | string | boolean | null;
            "channel": string;
        }[];
    "actions":
        {
            "device": number;
            "value": number | string | boolean | null;
            "channel": string;
            // secondi prima del comando e prima del ritorno allo stato di prima (Vito, 05/11)
            "delay"?: number;
            "duration"?: number;
        }[]
};

