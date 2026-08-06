import { Injectable, NgZone, inject, signal } from '@angular/core';
import {
    SwUpdate,
    VersionInstallationFailedEvent,
    VersionReadyEvent
} from '@angular/service-worker';
import { filter } from 'rxjs/operators';

export interface AvailablePwaUpdate {
    hash: string;
    version: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class SwUpdateService {
    readonly availableUpdate = signal<AvailablePwaUpdate | null>(null);

    private readonly swUpdate = inject(SwUpdate);
    private readonly ngZone = inject(NgZone);
    private initialized = false;
    private checkInProgress: Promise<boolean> | null = null;
    private lastCheckAt = 0;

    init(): void {
        if (this.initialized || !this.swUpdate.isEnabled) {
            return;
        }

        this.initialized = true;

        this.swUpdate.versionUpdates
            .pipe(filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'))
            .subscribe((event) => {
                const appData = event.latestVersion.appData as
                    | Record<string, unknown>
                    | undefined;
                const version = appData?.['version'];

                this.availableUpdate.set({
                    hash: event.latestVersion.hash,
                    version: typeof version === 'string' ? version : null
                });
            });

        this.swUpdate.versionUpdates
            .pipe(
                filter(
                    (event): event is VersionInstallationFailedEvent =>
                        event.type === 'VERSION_INSTALLATION_FAILED'
                )
            )
            .subscribe((event) => {
                console.error('Installazione aggiornamento PWA non riuscita', event.error);
            });

        this.swUpdate.unrecoverable.subscribe((event) => {
            console.error('Stato PWA non recuperabile', event.reason);
            window.location.reload();
        });

        this.ngZone.runOutsideAngular(() => {
            const check = () => void this.checkForUpdate();

            window.setTimeout(check, 3_000);
            window.setInterval(check, 5 * 60 * 1_000);
            window.addEventListener('online', check);
            window.addEventListener('focus', check);
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') {
                    check();
                }
            });
        });
    }

    reloadWithUpdate(): void {
        window.location.reload();
    }

    checkForUpdate(force = false): Promise<boolean> {
        const now = Date.now();

        if (!force && now - this.lastCheckAt < 60_000) {
            return Promise.resolve(false);
        }

        if (this.checkInProgress) {
            return this.checkInProgress;
        }

        this.lastCheckAt = now;
        this.checkInProgress = this.swUpdate.checkForUpdate()
            .catch((error: unknown) => {
                console.error('Controllo aggiornamenti PWA non riuscito', error);
                return false;
            })
            .finally(() => {
                this.checkInProgress = null;
            });

        return this.checkInProgress;
    }
}
