import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BestProcessTotalCostDto } from '../../../models/simulationTotalCostDto.model';
import { CamelcaseToWordsPipe, CustomizeSimulationTextPipe } from 'src/app/shared/pipes';

@Component({
  selector: 'app-best-process-table',
  templateUrl: './best-process-table.component.html',
  styleUrls: ['./best-process-table.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, FormsModule, MatTableModule, MatSortModule, MatFormFieldModule, MatInputModule, MatIconModule, MatTooltipModule, CamelcaseToWordsPipe, CustomizeSimulationTextPipe],
})
export class BestProcessTableComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() bestProcessList: BestProcessTotalCostDto[] = [];
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = [
    'countryName',
    'processName',
    'materialCost',
    'processCost',
    'toolingCost',
    'amortizationCost',
    'packagingCost',
    'logisticsCost',
    'ohpCost',
    'totalCost',
    'totalCostEsg',
  ];
  searchValue: string = '';
  @ViewChild(MatSort) sort: MatSort;

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.bestProcessList);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.dataSource && changes.bestProcessList && changes.bestProcessList.currentValue) {
      setTimeout(() => {
        this.dataSource.data = changes.bestProcessList.currentValue;
      }, 3000);
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
}
