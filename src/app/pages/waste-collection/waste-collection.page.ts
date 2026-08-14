import {CommonModule} from '@angular/common';
import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {firstValueFrom} from 'rxjs';
import {PageTitleComponent} from '../../components/page-title.component/page-title.component';
import {
    WasteCollectionDay,
    WasteCollectionScheduleEntry
} from '../../models/waste-collection.models';
import {AuthService} from '../../services/auth';
import {WasteCollectionApiService} from '../../services/waste-collection-api';

const DAY_LABELS: Record<WasteCollectionDay, string> = {
    MONDAY: 'Lunedì',
    TUESDAY: 'Martedì',
    WEDNESDAY: 'Mercoledì',
    THURSDAY: 'Giovedì',
    FRIDAY: 'Venerdì',
    SATURDAY: 'Sabato',
    SUNDAY: 'Domenica'
};

@Component({
    selector: 'waste-collection-page',
    standalone: true,
    imports: [CommonModule, FormsModule, PageTitleComponent],
    templateUrl: './waste-collection.page.html',
    styleUrls: ['../../../page.css', './waste-collection.page.css']
})
export class WasteCollectionPage implements OnInit {
    private readonly api = inject(WasteCollectionApiService);
    private readonly auth = inject(AuthService);

    readonly schedule = signal<WasteCollectionScheduleEntry[]>([]);
    readonly loading = signal(true);
    readonly error = signal<string | null>(null);
    readonly savingDay = signal<WasteCollectionDay | null>(null);
    readonly savedDay = signal<WasteCollectionDay | null>(null);
    readonly canEdit = computed(() => {
        const rawRoles = this.auth.currentUser()?.roles ?? [];
        const roles = Array.isArray(rawRoles)
            ? rawRoles
            : rawRoles.split(',').map(role => role.trim()).filter(Boolean);
        return roles.some(role => role === 'MASTER' || role === 'OWNER');
    });

    readonly materials: Partial<Record<WasteCollectionDay, string>> = {};

    ngOnInit(): void {
        void this.loadSchedule();
    }

    dayLabel(day: WasteCollectionDay): string {
        return DAY_LABELS[day];
    }

    async save(day: WasteCollectionDay): Promise<void> {
        if (!this.canEdit() || this.savingDay() !== null) return;
        this.error.set(null);
        this.savedDay.set(null);
        this.savingDay.set(day);
        try {
            const value = this.materials[day]?.trim() || null;
            const updated = await firstValueFrom(this.api.update(day, value));
            this.schedule.update(entries => entries.map(entry => entry.day === day ? updated : entry));
            this.materials[day] = updated.material ?? '';
            this.savedDay.set(day);
        } catch (error) {
            this.error.set(this.errorMessage(error, 'Impossibile salvare la raccolta'));
        } finally {
            this.savingDay.set(null);
        }
    }

    private async loadSchedule(): Promise<void> {
        this.loading.set(true);
        this.error.set(null);
        try {
            const entries = await firstValueFrom(this.api.schedule());
            this.schedule.set(entries);
            for (const entry of entries) this.materials[entry.day] = entry.material ?? '';
        } catch (error) {
            this.error.set(this.errorMessage(error, 'Impossibile caricare il calendario'));
        } finally {
            this.loading.set(false);
        }
    }

    private errorMessage(error: unknown, fallback: string): string {
        const candidate = error as {error?: {error?: string}; message?: string};
        return candidate.error?.error ?? candidate.message ?? fallback;
    }
}
