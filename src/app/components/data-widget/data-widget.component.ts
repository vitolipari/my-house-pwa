import {Component, Input} from '@angular/core';
import {DataCurrentChartComponent} from '../data-current-chart/data-current-chart.component';
import {ProgressiveAverageChartComponent} from '../progressive-average-chart/progressive-average-chart.component';
import {DataTrendChartComponent} from '../data-trend-chart/data-trend-chart.component';


export const CHART_TYPES = {
    gauge: 20,
    gaugeBars: 30
}


@Component({
    selector: 'data-widget',
    imports: [
        DataCurrentChartComponent,
        ProgressiveAverageChartComponent,
        DataTrendChartComponent
    ],
    templateUrl: './data-widget.component.html',
    standalone: true,
    styleUrl: './data-widget.component.css'
})
export class DataWidgetComponent {

    @Input() hasHistoric: boolean = true;
    @Input() chartType: number = 0;
    @Input() options: any;
    @Input() liveDataOptions: {
        placeholderColor: string;
        previousActiveColor: string;
        previousPaceholderColor: string;
        previousRay: number;
        previousWideRay: number;
        avgFont: string;
        avgColor: string;
        minFont: string;
        values: number[];
        ths: number;
        thsVisible: boolean;
        thsColor: string;
        axes: boolean;
        axeXColor: string;
        axeYColor: string;
        // width: number;
        // height: number;
        ray: number;
        wideRay: number;
        activeColor: string;
        antiActiveColor: string;
        mainFont: string;
        measureUnit: string;
        averageAreaColor: string;
    } = {

        placeholderColor: '#00f',
        previousActiveColor: '#00f',
        previousPaceholderColor: '#00f',
        previousRay: 38,
        previousWideRay: 10,
        avgFont: '6px orbitron',
        avgColor: '#00f',
        minFont: '12px orbitron',
        mainFont: '24px orbitron',
        measureUnit: 'w',
        antiActiveColor: '#0f0',
        values: [],
        ths: 100,
        thsVisible: false,
        thsColor: '#f003',
        axes: false,
        axeXColor: '#000',
        axeYColor: '#000',
        // width: 300,
        // height: 200,
        ray: 50,
        wideRay: 25,
        activeColor: '#35ff',
        averageAreaColor: '#003'
    };
    protected readonly CHART_TYPES = CHART_TYPES;
}
