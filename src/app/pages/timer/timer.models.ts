export type TimerType = {
    enabled: boolean;
    name: string;
    dayMinutes: boolean[];
    dayMinutesPack?: string;
    start: Date | number | string;
    end: Date | number | string;
    dateFormat: string;
    weekDays: boolean[];
    avoidDate: Date[] | number[] | string[];
    isHolidays: boolean;
    note?: string;
};

export const MINUTES_IN_A_DAY: number = 1440;

export const DATE_TIME_FORMAT: string = 'yyyymmddHHMM';


export type EventTimerType = {
    id: number;
    "timer": number;
    "trigger_time": string | number | Date;
    "slot_until": string | number | Date;
}


export type EventTimerActionType = {
    id: number;
    event_timer: number;
    payload_in?: any;
    payload_out?: any;
};


export type DeviceEventTimerActionType = {
    id: number;
    action: number;
    device: number;
    map?: any;
};


export type FullTimerType = TimerType & {
    id: number;
    slots: EventTimerType[]
    // TODO EventTimerActionType
    // TODO DeviceEventTimerActionType
};
