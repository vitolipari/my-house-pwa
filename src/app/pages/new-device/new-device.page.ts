import {Component, ElementRef, ViewChild} from '@angular/core';
import {PageTitleComponent} from '../../components/page-title.component/page-title.component';
import {Accordion, AccordionContent, AccordionHeader, AccordionModule, AccordionPanel} from 'primeng/accordion';


@Component({
    selector: 'app-new-device.page',
    imports: [
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
export class NewDevicePage {

    activeAccordionValue: string | number | string[] | number[] | null | undefined = '0';
    step: number = 0;
    deviceKnowledgeType: string = '';
    @ViewChild("newDevice", {static: true, read: ElementRef}) newDeviceElement!: ElementRef<HTMLDivElement>;
    @ViewChild("newDeviceIcon", {static: true, read: ElementRef}) newDeviceIcon!: ElementRef<SVGElement>;
    @ViewChild("knownDevice", {static: true, read: ElementRef}) knownDeviceElement!: ElementRef<HTMLDivElement>;
    @ViewChild("knownDeviceIcon", {static: true, read: ElementRef}) knownDeviceIcon!: ElementRef<SVGElement>;

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

        this.step = 2;
        this.activeAccordionValue = ''+ this.step;
    }
}
