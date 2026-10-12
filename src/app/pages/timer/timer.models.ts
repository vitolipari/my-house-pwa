export type TimerType = {
    name: string;
    dayMinutes: boolean[];
    start: Date | number | string;
    end: Date | number | string;
    dateFormat: string;
    weekDays: boolean[];
    avoidDate: Date[] | number[] | string[];
};

export const MINUTES_IN_A_DAY: number = 1440;

export const DATE_TIME_FORMAT: string = 'yyyymmddHHMM';
