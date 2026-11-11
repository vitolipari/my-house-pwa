import {Component, inject, OnDestroy, OnInit, signal, WritableSignal} from '@angular/core';
import {PageTitleComponent} from "../../../components/page-title.component/page-title.component";
import {Button} from 'primeng/button';
import {Checkbox, CheckboxChangeEvent} from 'primeng/checkbox';
import {FormsModule} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {SwitcherComponent} from '../../../components/switcher/switcher.component';
import {
    ActionChannelDeviceType,
    EventTriggerChannelDeviceType,
    ScenarioActionValuesType,
    ScenarioDTOType,
    ScenarioType
} from '../scenario.models';
import {DeviceType} from '../../devices/devices.models';
import {readScenarioAction} from '../scenario/scenario.page';
import {LongPressDirective} from '../../../directives/long-press.directive';
import {Router} from '@angular/router';
import {ScenarioApiService} from '../scenario-api';
import {firstValueFrom} from 'rxjs';
import {emoj} from '../../../utils/string-utils';
import {FullTimerType} from '../../timer/timer.models';

@Component({
  selector: 'app-scenarios.page',
    imports: [
        PageTitleComponent,
        Button,
        Checkbox,
        FormsModule,
        InputText,
        SwitcherComponent,
        LongPressDirective
    ],
  templateUrl: './scenarios.page.html',
  styleUrl: './scenarios.page.css',
})
export class ScenariosPage implements OnInit, OnDestroy {

    searchName: string = ''



    protected readonly isInWaiting = signal<boolean>(false);
    protected readonly isInSelection = signal<boolean>(false);
    protected readonly waitingScenarios = signal<number[]>([]);
    protected readonly isInDeleteMultiScenariosInWaiting = signal<boolean>(false);
    protected readonly isInSearchWaiting = signal<boolean>(false);
    protected readonly scenarios = signal<ScenarioType[]>([]);

    readonly router = inject(Router);
    readonly scenarioApi: ScenarioApiService = inject(ScenarioApiService);
    selectedScenarios: number[] = [];
    // signal: arriva dopo la lista e cambia con la WebSocket, quindi la pagina si deve ridisegnare
    protected readonly runningScenarios = signal<number[]>([]);
    private channel: WebSocket | null = null;     // WebSocket con il Core, aperta in ngOnInit e chiusa in ngOnDestroy


    ngOnInit(): void {

        this.isInWaiting.update(() => true);
        this.searchScenarios();
        this.loadRunningScenarios();

        // dal Core arriva il DeviceType di un dispositivo che ha cambiato lo stato o il valore di un canale. L'ingresso e
        // l'uscita di uno scenario cambiano sempre un dispositivo che ne fa parte: se il dispositivo è in un evento o in
        // un'azione di uno scenario della lista, gli scenari attivi si rileggono
        let protocol: string = (location.protocol === 'https:') ? 'wss://' : 'ws://';
        let channel: WebSocket = new WebSocket(protocol + location.host + '/api/core/');
        this.channel = channel;

        channel.onmessage = (msg: MessageEvent) => {

            let deviceID: number = 0;
            try {
                deviceID = parseInt(''+ (JSON.parse(msg.data) as DeviceType).id);
            }
            catch (e: any) {
                console.log('errore in onmessage di ScenariosPage: messaggio della WebSocket non valido');
                console.log(e);
                return;
            }

            // dispositivi di eventi e azioni: dal Core arrivano come DeviceType
            let scenarioDeviceIDs: number[] = [];
            this.scenarios()
                .forEach((scenario: ScenarioType) => {
                    scenario.triggers
                        .forEach((trigger: EventTriggerChannelDeviceType) => scenarioDeviceIDs.push(parseInt(''+ (trigger.device as unknown as DeviceType)?.id)))
                    ;
                    scenario.actions
                        .forEach((action: ActionChannelDeviceType) => scenarioDeviceIDs.push(parseInt(''+ (action.device as unknown as DeviceType)?.id)))
                    ;
                })
            ;

            if( !scenarioDeviceIDs.includes(deviceID) ) {
                return;
            }

            this.loadRunningScenarios();
        }

    }

    // uscendo dalla pagina la WebSocket si chiude, altrimenti a ogni nuova apertura se ne aggiungerebbe un'altra
    ngOnDestroy(): void {
        if( !!this.channel ) {
            this.channel.close();
        }
    }

    // scenari attivi nel Core (GET /running-scenario): all'apertura e quando cambia un dispositivo degli scenari
    private loadRunningScenarios() {
        return (
            firstValueFrom(this.scenarioApi.getRunningScenarios())
                .then((runningScenariosIDs: number[]) => {
                    this.runningScenarios.set(runningScenariosIDs);
                    return runningScenariosIDs;
                })
                .catch((error) => {
                    console.log('errore in loadRunningScenarios di ScenariosPage');
                    console.error(error);
                    return [];
                })
        );
    }


    protected addNewScenario() {
        this.router.navigate(
            ['/new-scenario'],
            {
                state: {
                    from: 'scenariosPage'
                }
            }
        );
    }

    protected deleteMultiScenarios() {
        this.isInDeleteMultiScenariosInWaiting.update(() => true);
        firstValueFrom(this.scenarioApi.deleteScenarios(this.selectedScenarios))
            .then(() => {
                this.isInDeleteMultiScenariosInWaiting.update(() => false);
                this.router.navigate(['/scenarios-page']);
                window.location.reload();
            })
            .catch((e) => {
                console.log(e);
            })
        ;
    }

    protected searchScenarios() {

        /*
        {
            id?: number | number[];
            name?: string;
            almostStartAt?: string | number;
            almostStopAt?: string | number;
            isInHolidaysToo?: boolean;
            pageSize?: number;
            pageNumber?: number;
        }
         */

        return (
            firstValueFrom(this.scenarioApi.searchScenarios())
                .then((list: ScenarioType[]) => {

                    this.scenarios.set(list);
                    this.isInWaiting.update(() => false);
                    console.log('lista scenari arrivati');
                    console.log(list);
                    return list;

                })
                .catch((error) => {
                    console.log('errore al caricamento degli scenari');
                    console.error(error);
                    return [];
                })
        )
    }

    protected toggleSelctedScenarios(scenario: ScenarioType, event: CheckboxChangeEvent) {
        this.selectedScenarios =
            this.selectedScenarios.filter((selected: number) => selected !== scenario.id);
        if (!!event.checked) {
            this.selectedScenarios.push(scenario.id);
        }
    }

    protected stopPropagation(event: PointerEvent | MouseEvent) {
        event.stopPropagation();
    }

    protected gotoScenarioPage(scenario: ScenarioType) {

        console.log('navigazione verso dettaglio scenario');
        console.log( scenario );
        console.log( this.scenarios().find((sc: ScenarioType) => sc.id === scenario.id) );

        this.router.navigate(
            ['/scenario-page', scenario.id],
            {
                state: {
                    from: 'scenariosPage',
                    details: scenario
                }
            }
        );
    }

    protected isScenarioInWaiting(scenario: ScenarioType) {
        return false;
    }

    protected toggleEnableScenario(scenario: ScenarioType, event: boolean) {

        this.waitingScenarios.update((list) => {
            if (event) {
                list.push(scenario.id);
            } else {
                list = list.filter((id) => id !== scenario.id);
            }
            return list;
        });

        scenario.enabled = event;

        // la PUT riceve lo stesso DTO della creazione: id del dispositivo, chiave del canale e valori; quelli delle
        // azioni si leggono dal comando del Core (POWER:ON;delay=30)
        let scenarioDto: ScenarioDTOType = {
            id: scenario.id,
            name: scenario.name,
            description: scenario.description,
            enabled: !!event,
            isImmediate: scenario.isImmediate,
            triggers:
                scenario.triggers
                    .map((trigger: any) => ({
                        device: parseInt(''+ trigger.device.id),
                        channel: trigger.channel.name,
                        valueBy: trigger.eventValueFrom,
                        valueUpTo: trigger.eventValueUpTo,
                        valueAt: trigger.eventValueAt
                    }))
            ,
            actions:
                scenario.actions
                    .map((action: any) => {

                        let actionValues: ScenarioActionValuesType = readScenarioAction(action.action);

                        return ({
                            device: parseInt(''+ action.device.id),
                            channel: action.channel.name,
                            value: actionValues.value,
                            delay: actionValues.delay,
                            duration: actionValues.duration
                        });
                    })
        };

        return (
            firstValueFrom(this.scenarioApi.editScenario( scenarioDto ))
                .then((result: any) => {

                    this.waitingScenarios.update((list) => {
                        list = list.filter((id) => id !== scenario.id);
                        return list;
                    });

                })
                .catch((error) => {
                    console.log('errore in toggleEnableScenario: abilitazione dello scenario');
                    console.error(error);

                    this.waitingScenarios.update((list) => {
                        list = list.filter((id) => id !== scenario.id);
                        return list;
                    });

                    return [];
                })
        )
    }

    protected onLongPress(scenario: WritableSignal<ScenarioType[]>) {
        this.isInSelection.set(true);
    }


    isRunning(scen: ScenarioType) {
        return (this.runningScenarios().includes(scen.id));
    }


}
