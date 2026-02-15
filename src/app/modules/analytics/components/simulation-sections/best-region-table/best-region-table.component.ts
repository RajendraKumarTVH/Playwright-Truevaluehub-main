import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { SimulationTotalCostDto } from '../../../models/simulationTotalCostDto.model';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CamelcaseToWordsPipe, CustomizeSimulationTextPipe } from 'src/app/shared/pipes';

@Component({
  selector: 'app-best-region-table',
  templateUrl: './best-region-table.component.html',
  styleUrls: ['./best-region-table.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, FormsModule, MatTableModule, MatSortModule, MatFormFieldModule, MatInputModule, MatIconModule, CamelcaseToWordsPipe, CustomizeSimulationTextPipe],
})
export class BestRegionTableComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() data: SimulationTotalCostDto[] = [];

  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = ['countryName', 'materialCost', 'processCost', 'toolingCost', 'amortizationCost', 'packagingCost', 'logisticsCost', 'ohpCost', 'totalCost', 'totalCostEsg'];
  searchValue: string = '';

  @ViewChild(MatSort) sort: MatSort;

  constructor(public sharedService: SharedService) {}

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.getMappedData(this.data));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.dataSource && changes.data && changes.data.currentValue) {
      setTimeout(() => {
        this.dataSource.data = this.getMappedData(changes.data.currentValue);
      }, 2000);
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  applyFilter(): void {
    this.dataSource.filter = this.searchValue.trim().toLowerCase();
  }

  clearFilter(): void {
    this.searchValue = '';
    this.applyFilter();
  }

  private getMappedData(data: SimulationTotalCostDto[]): any {
    return data.map((item) => ({
      countryId: item.countryId,
      countryName: item.countryName,
      materialCost: this.sharedService.isValidNumber(item.materialTotalCost),
      processCost: this.sharedService.isValidNumber(item.processTotalCost),
      toolingCost: this.sharedService.isValidNumber(item.toolingTotalCost),
      amortizationCost: this.sharedService.isValidNumber(item.toolingAmortizationCost),
      packagingCost: this.sharedService.isValidNumber(item.packagingTotalCost),
      logisticsCost: this.sharedService.isValidNumber(item.logisticsTotalCost),
      ohpCost: this.sharedService.isValidNumber(item.OHPTotalCost),
      totalCost: this.sharedService.isValidNumber(item.totalCost),
      totalCostEsg: this.sharedService.isValidNumber(item.totalCostESG),
    }));
  }
}
