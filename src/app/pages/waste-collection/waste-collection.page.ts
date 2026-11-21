import {CommonModule} from '@angular/common';
import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {firstValueFrom} from 'rxjs';
import {Button} from 'primeng/button';
import {Select} from 'primeng/select';
import {PageTitleComponent} from '../../components/page-title.component/page-title.component';
import {getLastElementOr} from '../../utils/array-util';
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

// i cinque materiali che il Core accetta, con le etichette in minuscolo come quelle di Alexa;
// il valore vuoto toglie la raccolta dal giorno
const MATERIAL_OPTIONS: {value: string, label: string}[] = [
    {value: '', label: 'nessuna raccolta'},
    {value: 'UMIDO', label: 'umido'},
    {value: 'CARTA E CARTONE', label: 'carta e cartone'},
    {value: 'VETRO', label: 'vetro'},
    {value: 'SECCO', label: 'secco'},
    {value: 'PLASTICA E ALLUMINIO', label: 'plastica e alluminio'}
];

@Component({
    selector: 'waste-collection-page',
    standalone: true,
    imports: [CommonModule, FormsModule, Button, Select, PageTitleComponent],
    templateUrl: './waste-collection.page.html',
    styleUrls: ['../../../page.css', './waste-collection.page.css']
})
export class WasteCollectionPage implements OnInit {

    Mode = {
        DETAILS: 'DETAILS',
        EDIT: 'EDIT'
    }

    currentMode: string = this.Mode.DETAILS;

    private readonly api = inject(WasteCollectionApiService);
    private readonly auth = inject(AuthService);

    readonly schedule = signal<WasteCollectionScheduleEntry[]>([]);
    readonly loading = signal(true);
    readonly error = signal<string | null>(null);
    readonly inWaiting = signal<boolean>(false);
    readonly canEdit = computed(() => {
        const rawRoles = this.auth.currentUser()?.roles ?? [];
        const roles = Array.isArray(rawRoles)
            ? rawRoles
            : rawRoles.split(',').map(role => role.trim()).filter(Boolean);
        return roles.some(role => role === 'MASTER' || role === 'OWNER');
    });

    readonly materials: Partial<Record<WasteCollectionDay, string>> = {};
    protected readonly MATERIAL_OPTIONS = MATERIAL_OPTIONS;

    ngOnInit(): void {
        void this.loadSchedule();
    }

    dayLabel(day: WasteCollectionDay): string {
        return DAY_LABELS[day];
    }

    // manda al Core i soli giorni cambiati, con il PUT di un giorno, e torna al dettaglio;
    // «nessuna raccolta» (valore vuoto) toglie la raccolta da quel giorno
    save(): Promise<void> {

        this.error.set(null);
        this.inWaiting.set(true);

        let changedEntries: WasteCollectionScheduleEntry[] = this.schedule()
            .filter((entry: WasteCollectionScheduleEntry) => (entry.material ?? '') !== this.materials[entry.day])
        ;

        return (
            Promise.all(
                changedEntries
                    .map((entry: WasteCollectionScheduleEntry) => firstValueFrom(this.api.update(entry.day, this.materials[entry.day] || null)))
            )
                .then((updatedEntries: WasteCollectionScheduleEntry[]) => {
                    this.schedule.update((entries: WasteCollectionScheduleEntry[]) =>
                        entries
                            .map((entry: WasteCollectionScheduleEntry) =>
                                updatedEntries
                                    .filter((updated: WasteCollectionScheduleEntry) => updated.day === entry.day)
                                    .reduce(getLastElementOr, entry)
                            )
                    );
                    this.inWaiting.set(false);
                    this.currentMode = this.Mode.DETAILS;
                })
                .catch((error: any) => {
                    console.log('errore nel salvataggio della raccolta');
                    console.log(error);
                    this.error.set(this.errorMessage(error, 'Impossibile salvare la raccolta'));
                    this.inWaiting.set(false);
                })
        );
    }

    private loadSchedule(): Promise<void> {
        this.loading.set(true);
        this.error.set(null);
        return (
            firstValueFrom(this.api.schedule())
                .then((entries: WasteCollectionScheduleEntry[]) => {
                    this.schedule.set(entries);
                    for (const entry of entries) this.materials[entry.day] = entry.material ?? '';
                    this.loading.set(false);
                })
                .catch((error: any) => {
                    console.log('errore nel caricamento del calendario della raccolta');
                    console.log(error);
                    this.error.set(this.errorMessage(error, 'Impossibile caricare il calendario'));
                    this.loading.set(false);
                })
        );
    }

    private errorMessage(error: unknown, fallback: string): string {
        const candidate = error as {error?: {error?: string}; message?: string};
        return candidate.error?.error ?? candidate.message ?? fallback;
    }
}
