import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { BestProcessTotalCostDto } from '../../../models/simulationTotalCostDto.model';
import { Chart } from 'chart.js';
import { Subject } from 'rxjs';
// import { debounceTime, takeUntil } from 'rxjs/operators';
import { BaseChartDirective } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-best-process-graphical',
  templateUrl: './best-process-graphical.component.html',
  styleUrls: ['./best-process-graphical.component.scss'],
  standalone: true,
  imports: [BaseChartDirective, CommonModule, MatIconModule],
})
export class BestProcessGraphicalComponent implements OnChanges, OnDestroy {
  @Input() data: BestProcessTotalCostDto[];
  public chart: Chart;
  private graphData: any = {};
  // public chartUpdateSubscribe$: Subject<any> = new Subject<any>();
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  private simulationData: BestProcessTotalCostDto[];
  private totalLegends: number;
  private initialsMap = new Map<string, string>();

  // ngOnInit(): void {
  // this.chartUpdateSubscribe$
  //   .asObservable()
  //   .pipe(debounceTime(2000), takeUntil(this.unsubscribe$))
  //   .subscribe((simulationData: BestProcessTotalCostDto[]) => {
  //     this.simulationData = simulationData;
  //     this.prepareGraph();
  //   });
  // }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data && changes.data.currentValue && changes.data.currentValue.length > 0) {
      // this.chartUpdateSubscribe$.next(changes.data.currentValue);
      this.prepareGraph(changes.data.currentValue);
    }
  }

  public prepareGraph(data: BestProcessTotalCostDto[]) {
    this.simulationData = data;
    const barWidth = 30;
    // if (this.simulationData.length <= 6) {
    //   barWidth = 80;
    // } else if (this.simulationData.length <= 12) {
    //   barWidth = 40;
    // } else if (this.simulationData.length <= 21) {
    //   barWidth = 30;
    // } else if (this.simulationData.length <= 30) {
    //   barWidth = 20;
    // }

    this.graphData = {};
    this.graphData.labels = [];
    this.graphData.datasets = [];
    const stdDataSets = [
      {
        label: 'Material($)',
        legendLabel: 'Material($)',
        data: [],
        backgroundColor: ['#89D6FB'],
        borderColor: ['#89D6FB'],
        borderWidth: 1,
        barThickness: barWidth,
        yAxisID: 'y',
        order: 2,
        stack: 'Stack 0',
      },
      {
        label: 'Process ($)',
        legendLabel: 'Process ($)',
        data: [],
        backgroundColor: ['#A1B5FF'],
        borderColor: ['#A1B5FF'],
        borderWidth: 1,
        barThickness: barWidth,
        yAxisID: 'y',
        order: 2,
        stack: 'Stack 0',
      },
      {
        label: 'Tooling ($)',
        legendLabel: 'Tooling ($)',
        data: [],
        backgroundColor: ['#FFA987'],
        borderColor: ['#FFA987'],
        borderWidth: 1,
        barThickness: barWidth,
        yAxisID: 'y',
        order: 2,
        stack: 'Stack 0',
      },
      {
        label: 'Packaging ($)',
        legendLabel: 'Packaging ($)',
        data: [],
        backgroundColor: ['#7094DB'],
        borderColor: ['#7094DB'],
        borderWidth: 1,
        barThickness: barWidth,
        yAxisID: 'y',
        order: 2,
        stack: 'Stack 0',
      },
      {
        label: 'Logistics ($)',
        legendLabel: 'Logistics ($)',
        data: [],
        backgroundColor: ['#AEC6CF'],
        borderColor: ['#AEC6CF'],
        borderWidth: 1,
        barThickness: barWidth,
        yAxisID: 'y',
        order: 2,
        stack: 'Stack 0',
      },
      {
        label: 'OHP($)',
        legendLabel: 'OHP($)',
        data: [],
        backgroundColor: ['#D3BFF3'],
        borderColor: ['#D3BFF3'],
        borderWidth: 1,
        barThickness: barWidth,
        yAxisID: 'y',
        order: 2,
        stack: 'Stack 0',
      },
    ];
    const esgColors = ['#90C16E', 'rgb(31, 65, 114)', 'rgb(121, 138, 101)', 'rgb(140, 51, 51)', 'rgba(255, 99, 71)'];

    this.getprocesses()
      .sort((a, b) => a.processId - b.processId)
      .forEach((p, i) => {
        this.graphData.datasets.push(...stdDataSets.map((d) => ({ ...d, label: { ...d }.label + ' - ' + p.processName, stack: 'Stack ' + i })));
        this.graphData.datasets.push({
          label: 'ESG - ' + p.processName,
          legendLabel: 'ESG',
          data: [],
          backgroundColor: esgColors[i],
          borderColor: esgColors[i],
          tension: 0.4,
          type: 'line',
          yAxisID: 'z',
          order: 1,
        });
      });
    this.totalLegends = stdDataSets.length + 1; // based on the no. of bar/line entries divided by no. of processes

    const { labels, datasets } = this.getData();
    this.graphData.labels = labels;
    this.graphData.datasets = this.graphData.datasets.map((d, i) => {
      return { ...d, data: datasets[i] };
    });
    console.log('Graphical Data in Datasets:', this.graphData.datasets);
    this.chart?.destroy();
    this.chart = new Chart('canvas', this.prepareConfig());
  }

  private prepareConfig() {
    return {
      type: 'bar',
      data: this.graphData,
      options: {
        plugins: {
          title: {
            display: false,
            font: {
              size: 20,
            },
          },
          responsive: true,
          maintainAspectRatio: true,
          tooltip: {
            enabled: true,
          },
          legend: {
            display: true,
            borderWidth: 0,
            onClick: (event, legendItem, legend) => {
              const index = legendItem.datasetIndex;
              const chart = legend.chart;
              const meta = chart.getDatasetMeta(index);
              meta.hidden = meta.hidden === null ? !chart.data.datasets[index].hidden : null;
              let datasetCnt = chart.data.datasets.length;
              while (datasetCnt > this.totalLegends && !this.isESG(legendItem.text)) {
                // looping to hide for all process
                datasetCnt -= this.totalLegends;
                chart.data.datasets[datasetCnt + index].hidden = meta.hidden;
              }
              chart.update();
            },
            labels: {
              boxWidth: 16,
              boxHeight: 16,
              color: '#000000',
              padding: 16,

              generateLabels: (chart) => {
                return chart.data.datasets.map((dataset, i) => {
                  const txt = dataset.legendLabel || dataset.label;
                  return {
                    datasetIndex: i,
                    text: this.isESG(txt) ? dataset.label : txt,
                    fillStyle: dataset.backgroundColor,
                    hidden: false,
                  };
                });
              },
              filter: (legendItem, _chartData) => {
                // Display only certain labels
                return legendItem.datasetIndex < this.totalLegends || this.isESG(legendItem.text); // show only the first set of labels and all ESG labels
                // return chartData.datasets.slice(0, this.totalLegends).map(d => d.label).includes(legendItem.text);
              },
            },
          },
        },
        scales: {
          x: {
            stacked: true,
            title: {
              color: '#000000',
              display: true,
              text: Array.from(this.initialsMap)
                .map(([key, value]) => `${value}: ${key}`)
                .join('            '),
            },
            grid: {
              display: false, // Hide x-axis grid lines
            },
            border: {
              color: '#A6A6A6', // X-axis line color
            },
            ticks: {
              autoSkip: false,
              color: '#000000', // X-axis values color
              // maxRotation: 0
            },
          },
          y: {
            beginAtZero: true,
            stacked: true,
            position: 'left',
            title: {
              display: true,
              text: 'Cost ($)',
              color: '#000000',
            },
            border: {
              color: '#000000', // Y-axis line color
            },
            grid: {
              display: false, // Hide x-axis grid lines
            },
          },
          z: {
            beginAtZero: true,
            stacked: false,
            position: 'right',
            title: {
              display: true,
              text: 'ESG (CO2 Kg)',
            },
            grid: {
              display: false,
            },
          },
        },
      },
    };
  }

  private getData() {
    const datasets = Array.from({ length: this.graphData.datasets.length }, () => []);
    const labels = [];
    this.getCountries().forEach((country) => {
      // looping the countries
      labels.push(['', country.countryName]);
      let ind = 0;
      this.simulationData
        .filter((s) => s.countryId === Number(country.countryId))
        .sort((a, b) => a.processId - b.processId)
        .forEach((data) => {
          // looping the processes
          labels[labels.length - 1][0] += (labels[labels.length - 1][0] !== '' ? ' - ' : '') + this.getInitials(data.processName); // get only the capital letters
          datasets[ind++].push(data?.materialCost ?? 0);
          datasets[ind++].push(data?.processCost ?? 0);
          datasets[ind++].push(data?.amortizationCost ?? 0);
          datasets[ind++].push(data?.packagingCost ?? 0);
          datasets[ind++].push(data?.logisticsCost ?? 0);
          datasets[ind++].push(data?.ohpCost ?? 0);
          datasets[ind++].push(data?.totalCostEsg ?? 0); // Line chart
        });
    });
    console.log('Graphical Data:', datasets);
    return { labels, datasets };
  }

  private getCountries() {
    return this.simulationData.filter((obj, index, self) => self.findIndex((o) => o.countryId === obj.countryId) === index);
  }

  private getprocesses() {
    return this.simulationData.filter((obj, index, self) => self.findIndex((o) => o.processId === obj.processId) === index);
  }

  private isESG(txt: string): boolean {
    return txt.toUpperCase().includes('ESG');
  }

  private getInitials(txt: string): string {
    if (!txt) return '';
    if (this.initialsMap.has(txt)) {
      return this.initialsMap.get(txt);
    } else {
      const initials = txt?.split('(')[0].replace(/[^A-Z]/g, '');
      this.initialsMap.set(txt, initials);
      return initials;
    }
  }

  ngOnDestroy() {
    this.chart?.destroy();
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }
}
