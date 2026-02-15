import { Component, Input, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { ChartConstructorType, HighchartsChartComponent, providePartialHighcharts } from 'highcharts-angular';
import { ChartTypeEnum } from 'src/app/shared/components/chart/chart.models';
import { barChartOptions, stockChartOptions, columnChartOptions } from '../chart/chart.constants';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type Highcharts from 'highcharts/esm/highcharts';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HighchartsLoaderService } from 'src/app/modules/costing/services/highcharts-loader.service';
@Component({
  selector: 'app-chart',
  imports: [HighchartsChartComponent, CommonModule, FormsModule, MatIconModule, MatProgressSpinnerModule],
  providers: [
    providePartialHighcharts({
      modules: () => [import('highcharts/esm/modules/stock'), import('highcharts/esm/modules/full-screen')],
    }),
  ],
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  standalone: true,
})
export class ChartComponent implements OnInit, OnChanges {
  chartOptions: Highcharts.Options = {};
  private _chartHeight: number;
  updateFlag: boolean = false;
  oneToOneFlag = true;
  chartRef: Highcharts.Chart | null = null;
  loader = inject(HighchartsLoaderService);
  @Input() chartConstructor: ChartConstructorType;
  @Input() title: string;
  @Input() chartData: any[];
  @Input() chartType: ChartTypeEnum;
  @Input() set chartHeight(value: number) {
    if (this._chartHeight !== value && this.chartType === ChartTypeEnum.Bar) {
      this._chartHeight = value;
      if (this.chartOptions && this.chartOptions.chart) {
        this.chartOptions.chart.height = value;
      }
    }
  }

  ngOnInit(): void {
    this.loader.load();
    if (this.chartType === ChartTypeEnum.Bar) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this;
      this.chartOptions.plotOptions.bar.dataLabels = {
        enabled: true,
        formatter: function () {
          let min = 0.0;
          let composition = self.chartData?.find((x) => x.compositionDescription == this.category);
          if (composition) {
            min = Math.round(composition.min * 100 * 1000) / 1000;
          }
          return `${min} - ${this.y} %`;
        },
      };
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('chart component ngOnChanges');
    if (changes['chartType']?.currentValue) {
      this.initBaseOptions();
    }
    if (changes['chartData']?.currentValue?.length) {
      this.applyData();
    }
  }
  toggleFullscreen(): void {
    if (this.chartRef) {
      this.chartRef.fullscreen?.toggle();
    }
  }

  getChartInstance(chart: Highcharts.Chart) {
    this.chartRef = chart;
    console.log('getChartInstance', this.chartRef);
  }

  updateColumnChart() {
    const cats = this.chartData.map((x) => x.countryName);
    const material = this.chartData.map((x) => +x.materialTotalCost || 0);
    const process = this.chartData.map((x) => +x.processTotalCost || 0);
    const tooling = this.chartData.map((x) => +x.toolingTotalCost || 0);
    const ohp = this.chartData.map((x) => +x.OHPTotalCost || 0);
    const packaging = this.chartData.map((x) => +x.packagingTotalCost || 0);
    const logistics = this.chartData.map((x) => +x.logisticsTotalCost || 0);
    const esg = this.chartData.map((x) => +x.totalCostESG || 0);
    const selectedCounties = this.chartData[0].selectedCountriesCount;
    let colGap = 0.05;
    if (selectedCounties === 1) {
      colGap = 0.0165;
    } else if (selectedCounties === 2) {
      colGap = 0.032;
    } else if (selectedCounties === 3) {
      colGap = 0.05;
    } else if (selectedCounties === 4) {
      colGap = 0.062;
    } else if (selectedCounties === 5) {
      colGap = 0.082;
    } else if (selectedCounties === 6) {
      colGap = 0.095;
    } else if (selectedCounties === 7) {
      colGap = 0.105;
    } else if (selectedCounties >= 8 && selectedCounties <= 10) {
      colGap = 0.13;
    } else if (selectedCounties >= 12 && selectedCounties <= 15) {
      colGap = 0.105;
    } else {
      colGap = 0.15;
    }
    // Clamp the internal gap so the two bars appear nearly touching
    colGap = Math.min(colGap, 0.2);
    let maxPointWidth = 35;
    if (selectedCounties >= 12) {
      maxPointWidth = 20;
    } else if (selectedCounties > 8) {
      maxPointWidth = 30;
    }
    this.chartOptions = {
      ...this.chartOptions,
      xAxis: { ...this.chartOptions.xAxis, categories: cats },
      plotOptions: {
        ...this.chartOptions.plotOptions,
        column: {
          ...this.chartOptions.plotOptions?.column,
          maxPointWidth: maxPointWidth,
        },
      },
      series: structuredClone([
        { name: 'Material(s)', type: 'column', data: [...material], stack: 'COST', yAxis: 0, pointRange: 1, pointPlacement: -colGap, color: '#89D6FB' },
        { name: 'Process(s)', type: 'column', data: [...process], stack: 'COST', yAxis: 0, pointRange: 1, pointPlacement: -colGap, color: '#A1B5FF' },
        { name: 'Tooling ($)', type: 'column', data: [...tooling], stack: 'COST', yAxis: 0, pointRange: 1, pointPlacement: -colGap, color: '#FFA987' },
        { name: 'OHP($)', type: 'column', data: [...ohp], stack: 'COST', yAxis: 0, pointPlacement: -colGap, color: '#D3BFF3' },
        { name: 'Packaging($)', type: 'column', data: [...packaging], stack: 'COST', yAxis: 0, pointRange: 1, pointPlacement: -colGap, color: '#7094DB' },
        { name: 'Logistics($)', type: 'column', data: [...logistics], stack: 'COST', yAxis: 0, pointRange: 1, pointPlacement: -colGap, color: '#FFFFC5' },
        { name: 'Total ESG (kgCO2)', type: 'column', data: [...esg], stack: 'ESG', yAxis: 1, pointRange: 1, color: '#90C16E', pointPlacement: colGap },
      ]),
    };
    this.updateFlag = true;
    //this.chartRef.redraw();
  }

  private initBaseOptions() {
    if (this.chartType === ChartTypeEnum.Column) {
      this.chartOptions = {
        ...columnChartOptions,
        chart: { ...columnChartOptions.chart, height: this._chartHeight ?? 420 },
      };
    }

    if (this.chartType === ChartTypeEnum.Bar) {
      this.chartOptions = {
        ...barChartOptions,
        chart: { height: this._chartHeight ?? 400 },
      };
    }

    if (this.chartType === ChartTypeEnum.Stock) {
      this.chartOptions = {
        ...stockChartOptions,
        chart: { height: this._chartHeight ?? 500 },
      };
    }
    this.updateFlag = true;
  }

  private applyData() {
    if (this.chartType === ChartTypeEnum.Column) {
      this.updateColumnChart();
    }
    if (this.chartData[0].hasOwnProperty('compositionDescription') && this.chartType === ChartTypeEnum.Bar) {
      this.updateBarChart();
    }
    if (this.chartType === ChartTypeEnum.Stock) {
      this.updateStockChart();
    }
  }

  updateBarChart() {
    const cats = this.chartData.map((x) => x.compositionDescription);
    const dataPoints = this.chartData.map((x) => Math.round(x.max * 100 * 1000) / 1000);
    this.chartOptions.xAxis = {
      categories: cats,
    };
    this.chartOptions.series[0] = {
      type: 'bar',
      data: dataPoints,
    };
    this.chartOptions.xAxis.lineWidth = 0;
    this.updateFlag = true;
  }

  updateStockChart() {
    const today = new Date();
    const nextMonth = today.getMonth() + 1;
    const year = today.getFullYear() + (nextMonth > 12 ? 1 : 0);
    const startDateTimestamp = Date.UTC(year, nextMonth, 1);
    const processedData = this.chartData.map(([x, y]) => {
      if (x >= startDateTimestamp) {
        return {
          x,
          y,
          marker: {
            enabled: true,
            symbol: 'circle',
            fillColor: 'transparent',
            radius: 3,
            lineColor: '#1591EA',
            lineWidth: 2,
          },
        };
      }
      return [x, y];
    });
    let series = Object.assign({}, this.chartOptions.series[0], {
      data: processedData,
    });
    const endDateTimestamp = this.chartData[this.chartData.length - 1][0];
    const years = new Date(endDateTimestamp).getUTCFullYear() - new Date(startDateTimestamp).getUTCFullYear();
    const months = new Date(endDateTimestamp).getUTCMonth() - new Date(startDateTimestamp).getUTCMonth();
    const totalMonths = years * 12 + months;
    const plotText = totalMonths === 1 ? '1 Month Forecast' : `${totalMonths} Months Forecast`;
    this.chartOptions.series[0] = series;
    this.chartOptions.xAxis = {
      ...this.chartOptions.xAxis,
      plotBands: [
        {
          color: '#ECF2FE',
          from: startDateTimestamp,
          to: endDateTimestamp,
          zIndex: 1,
          label: {
            text: plotText,
            align: 'center',
            verticalAlign: 'top',
            y: 20,
            style: {
              color: '#587CC6',
              fontWeight: '500',
              fontSize: '12px',
            },
          },
        },
      ],
    };
    this.updateFlag = true;
  }
}
