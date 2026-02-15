import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ChartConstructorType } from 'highcharts-angular';
import { Subject, takeUntil } from 'rxjs';
import { DfMaterialInfoDto } from 'src/app/modules/digital-factory/Models/df-material-info-dto';
import { DigitalFactoryService } from 'src/app/modules/digital-factory/Service/digital-factory.service';
import { ChartComponent } from 'src/app/shared/components/chart/chart.component';
import { ChartTypeEnum } from 'src/app/shared/components/chart/chart.models';

@Component({
  selector: 'app-price-chart',
  imports: [MatIcon, ChartComponent, CommonModule],
  templateUrl: './price-chart.component.html',
  styleUrl: './price-chart.component.scss',
})
export class PriceChartComponent implements OnInit {
  @Input() countryId?: number;
  @Input() supplierId?: number;
  @Input() selectedMaterialInfo?: DfMaterialInfoDto;
  stockData: any;
  matPriceData: any = [];
  past3MonthChange: number;
  next6MonthChange: number;
  threeMonthsStartDate: number;
  threeMonthsEndDate: number;
  next6MonthsStartDate: number;
  next6MonthsEndDate: number;
  stockConstructor: ChartConstructorType = 'stockChart';
  stockChartType: ChartTypeEnum = ChartTypeEnum.Stock;
  private readonly unsubscribe$: Subject<undefined> = new Subject<undefined>();

  constructor(private readonly digitalFactoryService: DigitalFactoryService) {}

  ngOnInit(): void {
    if (this.selectedMaterialInfo?.materialMasterId) {
      this.updateChart(this.selectedMaterialInfo?.materialMasterId);
    }
  }

  private updateChart(materialMasterId: number) {
    this.digitalFactoryService
      .GetMaterialInfosByMasterId(this.supplierId, materialMasterId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data) => {
        if (data?.length > 0) {
          this.matPriceData = data.map((x) => ({ timeStamp: new Date(x.effectiveDate).getTime(), price: Math.round(x.price * 1000) / 1000 })).sort((a, b) => b.timeStamp - a.timeStamp);
          let dataPoints = data.map((x) => [x.effectiveDate, Math.round(x.price * 1000) / 1000]);
          this.stockData = Array.from(dataPoints);
          this.past3MonthChange = 0;
          this.next6MonthChange = 0;
          const currentMonthStartPrice = this.stockData.find(([x, _]) => x === this.threeMonthsStartDate)?.[1];
          const threeMonthsEndPrice = this.stockData.find(([x, _]) => x === this.threeMonthsEndDate)?.[1];

          const next6MonthsStartPrice = this.stockData.find(([x, _]) => x === this.next6MonthsStartDate)?.[1];
          const next6MonthsEndPrice = this.stockData.find(([x, _]) => x === this.next6MonthsEndDate)?.[1];
          if (currentMonthStartPrice && threeMonthsEndPrice) {
            this.past3MonthChange = this.roundNumber(((currentMonthStartPrice - threeMonthsEndPrice) / threeMonthsEndPrice) * 100);
          }
          if (next6MonthsStartPrice && next6MonthsEndPrice) {
            this.next6MonthChange = this.roundNumber(((next6MonthsEndPrice - next6MonthsStartPrice) / next6MonthsStartPrice) * 100);
          }
        }
      });
  }

  roundNumber(value) {
    return Math.round(value * 1000) / 1000;
  }
}
