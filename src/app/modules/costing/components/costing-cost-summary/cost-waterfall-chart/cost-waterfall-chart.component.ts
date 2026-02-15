import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-cost-waterfall-chart',
  standalone: true,
  imports: [CommonModule, NgbPopover, MatIconModule],
  templateUrl: './cost-waterfall-chart.component.html',
  styleUrls: ['./cost-waterfall-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CostWaterfallChartComponent implements OnChanges {
  @Input() chartType: string;
  @Input() chartDataPercentage: number[] = [];
  exwPrevIndices = [];
  totPrevIndices = [];
  chartData = [];

  costChartData = [
    { label: 'Material Cost', percent: 25, color: '#89D6FB', id: 1 },
    { label: 'Manufact. Cost', percent: 25, color: '#A1B5FF', id: 2 },
    { label: 'Tooling Cost', percent: 10, color: '#FFA987', id: 3 },
    { label: 'Overhead & Profit', percent: 5, color: '#D3BFF3', id: 4 },
    { label: 'Packing Cost', percent: 5, color: '#7094DB', id: 5 },
    { label: 'EX-W Part Cost', percent: 70, color: '#7084fa', offset: 0, resetFlow: 1, popTitle: 'EX-W Part Cost', popContent: 'EX-W Part Cost', id: 6 },
    { label: 'Freight Cost', percent: 20, color: '#2f49be', id: 7 },
    { label: 'Duties & Tariff', percent: 10, color: '#ff4d4d', id: 8 },
    { label: 'Part Should Cost', percent: 100, color: '#000', offset: 0, resetFlow: 2, popTitle: 'Part Should Cost', popContent: 'Part Should Cost', id: 9 },
  ];

  esgChartData = [
    { label: 'Material ESG', percent: 35, color: '#89D6FB', id: 1 },
    { label: 'Manufact. ESG', percent: 35, color: '#A1B5FF', id: 2 },
    { label: 'Packing ESG', percent: 10, color: '#7094DB', id: 3 },
    { label: 'EX-W Part ESG', percent: 80, color: '', offset: 0, resetFlow: 1, popTitle: 'EX-W Part ESG', popContent: 'EX-W Part ESG', id: 4 },
    { label: 'Freight ESG', percent: 20, color: '#AEC6CF', id: 5 },
    { label: 'Total Part ESG', percent: 100, color: '', offset: 0, resetFlow: 2, popTitle: 'Total Part ESG', popContent: 'Total Part ESG', id: 6 },
  ];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['chartDataPercentage'] && changes['chartDataPercentage'].currentValue && changes['chartDataPercentage'].currentValue.length > 0) {
      let chartData = [];
      if (this.chartType === 'esg') {
        this.exwPrevIndices = [0, 1, 2];
        this.totPrevIndices = [0, 1, 2, 4];
        chartData = this.esgChartData.map((item, index) => {
          item.percent = this.chartDataPercentage[index] !== undefined ? Number(this.chartDataPercentage[index]) : 0;
          return item;
        });
      } else {
        this.exwPrevIndices = [0, 1, 2, 3, 4];
        this.totPrevIndices = [0, 1, 2, 3, 4, 6, 7];
        chartData = this.costChartData.map((item, index) => {
          item.percent = this.chartDataPercentage[index] !== undefined ? Number(this.chartDataPercentage[index]) : 0;
          return item;
        });
      }
      this.calculateOffsets(chartData);
    }
  }

  calculateOffsets(chartData) {
    let offset = 0;
    for (const item of chartData) {
      if (item.resetFlow) {
        item.offset = 0;
      } else {
        item.offset = offset;
        offset += item.percent;
      }
    }
    this.chartData = chartData;
  }

  // TrackBy functions
  trackByItem(index: number, item: any): number {
    return item.id;
  }

  trackByIndex(index: number, item: number): number {
    return item;
  }
}
