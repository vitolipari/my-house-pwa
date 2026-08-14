import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {
    WasteCollectionDay,
    WasteCollectionScheduleEntry
} from '../models/waste-collection.models';

@Injectable({providedIn: 'root'})
export class WasteCollectionApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = '/api/core/waste-collection';

    schedule(): Observable<WasteCollectionScheduleEntry[]> {
        return this.http.get<WasteCollectionScheduleEntry[]>(`${this.baseUrl}/schedule`);
    }

    update(day: WasteCollectionDay, material: string | null): Observable<WasteCollectionScheduleEntry> {
        return this.http.put<WasteCollectionScheduleEntry>(
            `${this.baseUrl}/schedule/${day}`,
            {material}
        );
    }
}
