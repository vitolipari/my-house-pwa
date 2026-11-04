import {Component, inject, OnInit, signal, WritableSignal} from '@angular/core';
import {PageTitleComponent} from "../../../components/page-title.component/page-title.component";
import {Button} from 'primeng/button';
import {Checkbox, CheckboxChangeEvent} from 'primeng/checkbox';
import {FormsModule} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {SwitcherComponent} from '../../../components/switcher/switcher.component';
import {ScenarioType} from '../scenario.models';
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
export class ScenariosPage implements OnInit {

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


    ngOnInit(): void {

        this.isInWaiting.update(() => true);
        this.searchScenarios();

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

        return (
            firstValueFrom(this.scenarioApi.enableScenarios( scenario ))
                .then((result: any) => {

                    this.waitingScenarios.update((list) => {
                        list = list.filter((id) => id !== scenario.id);
                        return list;
                    });

                })
                .catch((error) => {
                    console.log('errore al caricamento degli scenari');
                    console.error(error);
                    return [];
                })
        )
    }

    protected onLongPress(scenario: WritableSignal<ScenarioType[]>) {
        this.isInSelection.set(true);
    }



}
