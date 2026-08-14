import {CommonModule} from '@angular/common';
import {Component, ElementRef, inject, OnInit, signal, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {firstValueFrom} from 'rxjs';
import {PageTitleComponent} from '../../components/page-title.component/page-title.component';
import {Accordion, AccordionContent, AccordionHeader, AccordionModule, AccordionPanel} from 'primeng/accordion';
import {DeviceCatalogItem, DeviceTaxonomy, DeviceTypeDefinition} from '../../models/device.models';
import {DeviceApiService} from '../../services/device-api';


@Component({
    selector: 'app-new-device.page',
    imports: [
        CommonModule,
        FormsModule,
        PageTitleComponent,
        Accordion,
        AccordionPanel,
        AccordionHeader,
        AccordionContent
    ],
    templateUrl: './new-device.page.html',
    styleUrls: [
        // '../../components/page-title.component/page-title.component.css',
        './new-device.page.css'
    ],
    standalone: true
})
export class NewDevicePage implements OnInit {

    private readonly deviceApi = inject(DeviceApiService);

    activeAccordionValue: string | number | string[] | number[] | null | undefined = '0';
    step: number = 0;
    deviceKnowledgeType: string = '';
    integration: string = '';
    selectedFunctionalType: string = '';
    selectedUsage: string = '';
    selectedCatalogItemId: string = '';
    readonly catalog = signal<DeviceCatalogItem[]>([]);
    readonly taxonomy = signal<DeviceTaxonomy>({categories: [], types: [], usages: []});
    readonly taxonomyLoading = signal(true);
    readonly taxonomyError = signal<string | null>(null);
    @ViewChild("newDevice", {static: true, read: ElementRef}) newDeviceElement!: ElementRef<HTMLDivElement>;
    @ViewChild("newDeviceIcon", {static: true, read: ElementRef}) newDeviceIcon!: ElementRef<SVGElement>;
    @ViewChild("knownDevice", {static: true, read: ElementRef}) knownDeviceElement!: ElementRef<HTMLDivElement>;
    @ViewChild("knownDeviceIcon", {static: true, read: ElementRef}) knownDeviceIcon!: ElementRef<SVGElement>;

    async ngOnInit(): Promise<void> {
        try {
            const [taxonomy, catalog] = await Promise.all([
            firstValueFrom(this.deviceApi.taxonomy()),
                firstValueFrom(this.deviceApi.catalog())
            ]);

            console.log('response di taxonomy');
            console.log(taxonomy);

            console.log('response di catalog');
            console.log(catalog);

            this.taxonomy.set(taxonomy);
            this.catalog.set(catalog);
        } catch (error) {
            const candidate = error as {error?: {error?: string}; message?: string};
            this.taxonomyError.set(
                candidate.error?.error ?? candidate.message ?? 'Impossibile caricare tipi e categorie'
            );
        } finally {
            this.taxonomyLoading.set(false);
        }
    }

    commisioningTypeSelected(deviceKnowledge: string) {
        // this.step = (this.step === 0 ) ? 1 : this.step;
        this.step = 1;
        this.deviceKnowledgeType = deviceKnowledge;

        // selezione card
        if( deviceKnowledge === 'newDevice' ) {
            this.newDeviceElement.nativeElement.style.cssText = '; color: var(--color-text-2);'
            this.newDeviceIcon.nativeElement.style.cssText = '; opacity: 1;'
            this.knownDeviceElement.nativeElement.style.cssText = '; color: var(--color-text-0);'
            this.knownDeviceIcon.nativeElement.style.cssText = '; opacity: 0.3;'
        }
        else {
            this.newDeviceElement.nativeElement.style.cssText = '; color: var(--color-text-0);'
            this.newDeviceIcon.nativeElement.style.cssText = '; opacity: 0.3;'
            this.knownDeviceElement.nativeElement.style.cssText = '; color: var(--color-text-2);'
            this.knownDeviceIcon.nativeElement.style.cssText = '; opacity: 1;'
        }

        this.activeAccordionValue = ''+ this.step;


    }


    deviceVendorTypeSelected(family: string) {
        this.integration = family;
        this.selectedFunctionalType = '';
        this.selectedUsage = '';
        this.selectedCatalogItemId = '';
        this.step = 2;
        this.activeAccordionValue = ''+ this.step;
    }

    selectedTypeDefinition(): DeviceTypeDefinition | null {
        return this.taxonomy().types.find(type => type.id === this.selectedFunctionalType) ?? null;
    }

    selectedCatalogItem(): DeviceCatalogItem | null {
        return this.catalog().find(item => item.id === this.selectedCatalogItemId) ?? null;
    }

    compatibleTypeDefinitions(): DeviceTypeDefinition[] {
        const compatibleTypes = this.selectedCatalogItem()?.compatibleTypes ?? [];
        return compatibleTypes
            .map(id => this.taxonomy().types.find(type => type.id === id))
            .filter((type): type is DeviceTypeDefinition => type !== undefined);
    }

    catalogItemSelected(): void {
        this.selectedFunctionalType = '';
        this.selectedUsage = this.selectedCatalogItem()?.usage ?? '';
    }

    typeSupportsUsage(): boolean {
        return [
            'SWITCH',
            'METERED_SWITCH',
            'DIMMER',
            'METERED_DIMMER',
            'COLOR_DIMMER',
            'POWER_METER'
        ].includes(this.selectedFunctionalType);
    }

    functionalTypeSelected(): void {
        this.selectedUsage = this.selectedCatalogItem()?.usage ?? '';
    }

    selectCatalogItemId(id: string) {
        this.selectedCatalogItemId = id;
    }
}
