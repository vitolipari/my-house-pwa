export type WasteCollectionDay =
    | 'MONDAY'
    | 'TUESDAY'
    | 'WEDNESDAY'
    | 'THURSDAY'
    | 'FRIDAY'
    | 'SATURDAY'
    | 'SUNDAY';

export interface WasteCollectionScheduleEntry {
    day: WasteCollectionDay;
    material: string | null;
    updatedAt: string | null;
}
