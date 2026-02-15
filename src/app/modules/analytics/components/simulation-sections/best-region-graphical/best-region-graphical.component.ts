import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { SimulationTotalCostDto } from '../../../models/simulationTotalCostDto.model';
import { Chart, ChartConfiguration } from 'chart.js';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { BaseChartDirective } from 'ng2-charts';
import { MatIconModule } from '@angular/material/icon';
// import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-best-region-graphical',
  templateUrl: './best-region-graphical.component.html',
  styleUrls: ['./best-region-graphical.component.scss'],
  standalone: true,
  imports: [MatIconModule, BaseChartDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BestRegionGraphicalComponent implements OnInit, OnChanges, OnDestroy {
  @Input() data: SimulationTotalCostDto[];
  public chart: Chart;
  private graphData: any = {};
  // public graphWidth = 1500;
  public chartUpdateSubscribe$: Subject<any> = new Subject<any>();
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();

  ngOnInit(): void {
    this.chartUpdateSubscribe$
      .asObservable()
      .pipe(debounceTime(2000), takeUntil(this.unsubscribe$))
      .subscribe((simulationData: SimulationTotalCostDto[]) => {
        this.bindNewData(simulationData);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data && changes.data.currentValue && changes.data.currentValue.length > 0) {
      this.chartUpdateSubscribe$.next(this.data);
    }
  }

  public bindNewData(simulationData: SimulationTotalCostDto[] = []) {
    // const sortedList = simulationData.sort((a, b) => (Number(a.totalCost ?? 0) < Number(b.totalCost ?? 0) ? -1 : 1));
    const sortedList = [...simulationData];
    sortedList.sort((a, b) => Number(a.totalCost ?? 0) - Number(b.totalCost ?? 0));
    this.prepareGraph(sortedList);
  }

  private prepareGraph(simulationData: SimulationTotalCostDto[]) {
    // this.applyChartWidth(simulationData.length);
    this.graphData = {};
    this.graphData.labels = simulationData.map((x) => x.countryName);
    let barWidth = 10;
    if (simulationData.length <= 8) {
      barWidth = 80;
    } else if (simulationData.length <= 16) {
      barWidth = 40;
    } else if (simulationData.length <= 24) {
      barWidth = 20;
    } else if (simulationData.length <= 32) {
      barWidth = 15;
    }
    this.graphData.datasets = [
      {
        label: 'Material($)',
        data: [],
        backgroundColor: ['#89D6FB'],
        borderColor: ['#89D6FB'],
        borderWidth: 1,
        barThickness: barWidth,
        yAxisID: 'y',
        order: 2,
      },
      {
        label: 'Process ($)',
        data: [],
        backgroundColor: ['#A1B5FF'],
        borderColor: ['#A1B5FF'],
        borderWidth: 1,
        barThickness: barWidth,
        yAxisID: 'y',
        order: 2,
      },
      // {
      //   label: 'Tooling ($)',
      //   data: simulationData.map(x => x.toolingTotalCost),
      //   backgroundColor: [
      //     'rgba(0, 26, 104, 0.2)'
      //   ],
      //   borderColor: [
      //     'rgba(0, 26, 104, 1)'
      //   ],
      //   borderWidth: 1,
      //   order: 2
      // },
      {
        label: 'Tooling ($)',
        data: [],
        backgroundColor: ['#FFA987'],
        borderColor: ['#FFA987'],
        borderWidth: 1,
        barThickness: barWidth,
        yAxisID: 'y',
        order: 2,
      },
      {
        label: 'Packaging($)',
        data: [],
        backgroundColor: ['#7094DB'],
        borderColor: ['#7094DB'],
        borderWidth: 1,
        barThickness: barWidth,
        yAxisID: 'y',
        order: 2,
      },
      {
        label: 'Logistics($)',
        data: [],
        backgroundColor: ['#AEC6CF'],
        borderColor: ['#AEC6CF'],
        borderWidth: 1,
        barThickness: barWidth,
        yAxisID: 'y',
        order: 2,
      },
      {
        label: 'OHP($)',
        data: [],
        backgroundColor: ['#D3BFF3'],
        borderColor: ['#D3BFF3'],
        borderWidth: 1,
        barThickness: barWidth,
        yAxisID: 'y',
        order: 2,
      },
      {
        label: 'Total ESG(KgCO2)',
        data: [],
        backgroundColor: '#90C16E',
        borderColor: '#90C16E',
        tension: 0.4,
        type: 'line',
        yAxisID: 'y1',
        order: 1,
      },
    ];
    this.setData(simulationData);
    const graphConfig = this.prepareConfig(this.graphData);
    this.chart?.destroy();
    this.chart = new Chart('canvas', graphConfig);
  }

  private prepareConfig(data: any): ChartConfiguration<'bar'> {
    return {
      type: 'bar',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            labels: {
              boxWidth: 16,
              boxHeight: 16,
              font: {
                size: 12,
                weight: 'normal',
              },
              color: '#666666',
              padding: 16,
            },
            align: 'start',
            position: 'top',
            fullSize: true,
          },
          tooltip: {
            enabled: true,
          },
        },
        layout: {
          padding: {
            top: 0,
            bottom: 0,
          },
        },
        scales: {
          x: {
            stacked: true,
            grid: {
              display: false, // Hide x-axis grid lines
            },
            ticks: {
              color: '#000000', // X-axis values color
            },
            border: {
              color: '#A6A6A6', // X-axis line color
            },
            title: {
              color: '#000000',
            },
          },
          y: {
            beginAtZero: true,
            stacked: true,
            position: 'left',
            title: {
              display: true,
              text: 'Part Cost ($)',
              color: '#000000',
            },
            border: {
              color: '#000000', // Y-axis line color
            },
            grid: {
              display: false, // Hide x-axis grid lines
            },
          },
          y1: {
            beginAtZero: false,
            stacked: true,
            position: 'right',
            title: {
              display: true,
              text: 'ESG (CO2 Kg)',
              color: '#000000',
            },
            grid: {
              display: false, // Hide y1-axis grid lines
            },
          },
        },
      },
    };
  }

  private setData(simulationData: SimulationTotalCostDto[]) {
    simulationData.forEach((data) => {
      this.graphData.datasets[0].data.push(data?.materialTotalCost ?? 0);
      this.graphData.datasets[1].data.push(data?.processTotalCost ?? 0);
      this.graphData.datasets[2].data.push(data?.toolingAmortizationCost ?? 0);
      this.graphData.datasets[3].data.push(data?.packagingTotalCost ?? 0);
      this.graphData.datasets[4].data.push(data?.logisticsTotalCost ?? 0);
      this.graphData.datasets[5].data.push(data?.OHPTotalCost ?? 0);
      this.graphData.datasets[6].data.push(data?.totalCostESG ?? 0); // Line chart
    });
    // this.countOfCountries = simulationData.length;
  }

  // private applyChartWidth(countOfCountries) {
  //   let value = (countOfCountries * 25) + 100;
  //   this.graphWidth = (value > 950 ? value : 950);
  //   let canvas: any = document.getElementById('canvas');
  //   canvas.width = this.graphWidth;
  //   canvas.style.width = this.graphWidth;
  //   canvas.height = 500;
  //   canvas.style.height = 500;
  // }

  ngOnDestroy() {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }
}
