import {CommonModule} from '@angular/common';
import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {firstValueFrom} from 'rxjs';
import {
    AddDeviceRequest,
    CommissioningJob,
    DeviceIntegrationStatus,
    DeviceProtocol,
    DeviceRecord,
    DeviceTaxonomy,
    DiscoveredDevice
} from '../../models/device.models';
import {AuthService} from '../../services/auth';
import {DeviceApiService} from '../../services/device-api';

@Component({
    selector: 'app-devices-page',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './devices.page.html',
    styleUrl: './devices.page.css'
})
export class DevicesPageTraining implements OnInit, OnDestroy {
    private readonly api = inject(DeviceApiService);
    private readonly auth = inject(AuthService);
    private destroyed = false;

    readonly devices = signal<DeviceRecord[]>([]);
    readonly discovered = signal<DiscoveredDevice[]>([]);
    readonly integrations = signal<DeviceIntegrationStatus[]>([]);
    readonly taxonomy = signal<DeviceTaxonomy>({categories: [], types: [], usages: []});
    readonly loading = signal(false);
    readonly discovering = signal(false);
    readonly saving = signal(false);
    readonly commissioning = signal<CommissioningJob | null>(null);
    readonly message = signal<string | null>(null);
    readonly error = signal<string | null>(null);

    matterForm = {
        pairingCode: '',
        name: '',
        place: ''
    };

    manualForm: AddDeviceRequest = {
        name: '',
        protocol: 'manual',
        integration: 'manual',
        externalId: '',
        address: '',
        place: '',
        description: '',
        functionalType: '',
        usage: ''
    };

    get canManage(): boolean {
        const value = this.auth.currentUser()?.roles ?? [];
        const roles = Array.isArray(value)
            ? value
            : value.split(',').map(role => role.trim()).filter(Boolean);
        return roles.includes('MASTER') || roles.includes('OWNER');
    }

    async ngOnInit(): Promise<void> {
        await this.refresh();
    }

    ngOnDestroy(): void {
        this.destroyed = true;
    }

    async refresh(): Promise<void> {
        this.loading.set(true);
        this.clearFeedback();
        try {
            const [devices, integrations, taxonomy] = await Promise.all([
                firstValueFrom(this.api.list()),
                firstValueFrom(this.api.integrations()),
                firstValueFrom(this.api.taxonomy())
            ]);
            this.devices.set(devices);
            this.integrations.set(integrations);
            this.taxonomy.set(taxonomy);
        } catch (error) {
            this.error.set(this.errorMessage(error));
        } finally {
            this.loading.set(false);
        }
    }

    async discover(): Promise<void> {
        this.discovering.set(true);
        this.clearFeedback();
        try {
            const result = await firstValueFrom(this.api.discover());
            this.discovered.set(result.devices);
            const integrationError = result.integrations.find(item => item.error)?.error;
            if (integrationError) this.error.set(integrationError);
            else this.message.set(`${result.devices.length} dispositivi Matter rilevati`);
            await this.refreshDevicesOnly();
        } catch (error) {
            this.error.set(this.errorMessage(error));
        } finally {
            this.discovering.set(false);
        }
    }

    async commissionMatter(): Promise<void> {
        const pairingCode = this.matterForm.pairingCode.trim();
        if (!pairingCode) {
            this.error.set('Inserisci il codice manuale o il payload QR Matter.');
            return;
        }

        this.clearFeedback();
        try {
            const job = await firstValueFrom(this.api.commissionMatter({
                pairingCode,
                name: this.matterForm.name.trim() || undefined,
                place: this.matterForm.place.trim() || null
            }));
            this.matterForm.pairingCode = '';
            this.commissioning.set(job);
            await this.pollCommissioning(job.id);
        } catch (error) {
            this.error.set(this.errorMessage(error));
        }
    }

    async addManual(): Promise<void> {
        this.saving.set(true);
        this.clearFeedback();
        try {
            const created = await firstValueFrom(this.api.add({...this.manualForm}));
            this.devices.update(items => [created, ...items]);
            this.message.set(`${created.name} aggiunto al registro unificato`);
            const protocol = this.manualForm.protocol;
            this.manualForm = {
                name: '',
                protocol,
                integration: protocol,
                externalId: '',
                address: '',
                place: '',
                description: '',
                functionalType: '',
                usage: ''
            };
        } catch (error) {
            this.error.set(this.errorMessage(error));
        } finally {
            this.saving.set(false);
        }
    }

    changeManualProtocol(protocol: DeviceProtocol): void {
        this.manualForm.protocol = protocol;
        this.manualForm.integration = protocol;
    }

    private async pollCommissioning(jobId: string): Promise<void> {
        for (let attempt = 0; attempt < 130 && !this.destroyed; attempt += 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            try {
                const job = await firstValueFrom(this.api.commissioningJob(jobId));
                this.commissioning.set(job);
                if (job.status === 'COMPLETED') {
                    this.message.set(`${job.device?.name ?? 'Dispositivo Matter'} aggiunto alla fabric LipariOS`);
                    await this.refreshDevicesOnly();
                    return;
                }
                if (job.status === 'FAILED') {
                    this.error.set(job.error ?? 'Commissioning Matter non riuscito');
                    return;
                }
            } catch (error) {
                this.error.set(this.errorMessage(error));
                return;
            }
        }
        if (!this.destroyed) this.error.set('Il commissioning non ha risposto entro il tempo previsto.');
    }

    private async refreshDevicesOnly(): Promise<void> {
        this.devices.set(await firstValueFrom(this.api.list()));
    }

    private clearFeedback(): void {
        this.message.set(null);
        this.error.set(null);
    }

    private errorMessage(error: unknown): string {
        const candidate = error as {error?: {error?: string}; message?: string};
        return candidate.error?.error ?? candidate.message ?? 'Operazione non riuscita';
    }
}
