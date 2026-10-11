import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {PageTitleComponent} from '../../components/page-title.component/page-title.component';
import {FormsModule} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {DeviceType, GroupType} from '../devices/devices.models';
import {firstValueFrom} from 'rxjs';
import {DeviceApiService} from '../devices/device-api';
import {emoj} from '../../utils/string-utils';
import {Button} from 'primeng/button';
import {GroupsApiService} from '../groups/groups-api';
import {Router} from '@angular/router';
import {Checkbox, CheckboxChangeEvent} from 'primeng/checkbox';


@Component({
  selector: 'app-new-group.page',
    imports: [
        PageTitleComponent,
        FormsModule,
        InputText,
        Button,
        Checkbox
    ],
  templateUrl: './new-group.page.html',
  styleUrl: './new-group.page.css',
})
export class NewGroupPage implements OnInit {

    // signals
    readonly data = signal<GroupType>({
        id: 0,
        name: '',
        description: '',
        device_list: ''
    });
    readonly devices = signal<DeviceType[]>([]);
    readonly devicesLoading = signal(true);
    readonly devicesError = signal<string | null>(null);
    readonly savingError = signal<string | null>(null);
    protected readonly isReadyToSet = computed(() => (
        this.data().name.trim().length > 0
    ));
    protected readonly isSavingInWait = signal<boolean>(false);


    // services
    private readonly deviceApi = inject(DeviceApiService);
    private readonly groupsApi = inject(GroupsApiService);
    private readonly router = inject(Router);


    ngOnInit(): void {
        console.log('new group on Init');
        void this.loadDevices();
    }

    // a differenza delle stanze un dispositivo può stare in più gruppi: si mostrano tutti
    loadDevices(): Promise<void> {
        this.devicesLoading.set(true);
        this.devicesError.set(null);

        return firstValueFrom(this.deviceApi.list())
            .then((devices: DeviceType[]) => {
                this.devices.set(devices);
                this.devicesLoading.set(false);
                console.log('dispositivi arrivati per il nuovo gruppo');
            })
            .catch((error: unknown) => {
                console.log('errore in loadDevices del nuovo gruppo');
                console.log(error);

                const candidate = error as {error?: {error?: string}; message?: string};
                this.devicesError.set(
                    candidate.error?.error ?? candidate.message ?? 'Impossibile caricare i dispositivi'
                );
                this.devicesLoading.set(false);
            });
    }

    itemEmojIcon( emojIconName: string) {
        return emoj( emojIconName || '' );
    }


    // data si aggiorna sempre con un oggetto nuovo, altrimenti il signal non notifica
    protected setName(name: string) {
        this.data.update((data: GroupType) => ({...data, name}));
    }

    protected setDescription(description: string) {
        this.data.update((data: GroupType) => ({...data, description}));
    }

    protected toggleSelctedDevice(device: DeviceType, event: CheckboxChangeEvent) {
        const ids: string[] =
            (this.data().device_list || '')
                .split(',')
                .filter((id: string) => !!id && id !== String(device.id))
        ;
        if( !!event.checked ) {
            ids.push(String(device.id));
        }
        this.data.update((data: GroupType) => ({
            ...data,
            device_list: ids.join(',')
        }));
    }

    protected addNewGroup() {
        console.log('dati del nuovo gruppo');
        console.log(this.data());
        this.isSavingInWait.set(true);
        this.savingError.set(null);

        return firstValueFrom(this.groupsApi.newGroup(this.data()))
            .then((response: {status: string; data: GroupType; note: string}) => {
                this.isSavingInWait.set(false);
                this.router.navigate(
                    ['/devices-page'],
                    {
                        state: {
                            from: 'newGroupPage',
                            tab: 'groups',
                            newId: response.data?.id
                        }
                    }
                );
            })
            .catch((error: unknown) => {
                console.log('errore in addNewGroup');
                console.log(error);

                const candidate = error as {error?: {note?: string}; message?: string};
                this.savingError.set(
                    candidate.error?.note || candidate.message || 'Impossibile salvare il gruppo'
                );
                this.isSavingInWait.set(false);
            });
    }
}
