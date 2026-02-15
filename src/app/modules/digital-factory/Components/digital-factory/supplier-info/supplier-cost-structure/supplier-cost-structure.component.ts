import { Component, Input, OnDestroy, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { DfSupplierDirectoryMasterDto } from 'src/app/modules/digital-factory/Models/df-supplier-directory-master-dto';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DigitalFactoryService } from 'src/app/modules/digital-factory/Service/digital-factory.service';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs/internal/Subject';
import { CommonModule } from '@angular/common';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { SupplierCostStructureTableConfig } from './supplier-cost-structure-table-config';
import { DfSupplierCostStructureDto } from 'src/app/modules/digital-factory/Models/df-supplier-cost-structure-dto';
import { EditPageBase } from '../../../Shared/edit-state/edit-page.base';
import { Observable, of } from 'rxjs';
import { EditToolbarComponent } from '../../../Shared/edit-toolbar/edit-toolbar.component';

@Component({
  selector: 'app-supplier-cost-structure',
  templateUrl: './supplier-cost-structure.component.html',
  styleUrls: ['./supplier-cost-structure.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatTableModule, MatSortModule, EditToolbarComponent],
})
export class SupplierCostStructureComponent extends EditPageBase<DfSupplierDirectoryMasterDto> implements OnInit, OnDestroy, AfterViewInit {
  @Input() supplierInfo?: DfSupplierDirectoryMasterDto;
  @ViewChild(MatSort) sort!: MatSort;
  isSaveEnabled = false;
  form!: FormGroup;
  private readonly unsubscribe$: Subject<undefined> = new Subject<undefined>();

  // Table properties
  columnConfig = {};
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource();
  costStructureData: DfSupplierCostStructureDto[] = [];
  selectedCostStructureCategory: DfSupplierCostStructureDto;
  selectedColumn: string;
  changedValue: number;

  constructor(
    private readonly digitalFactoryService: DigitalFactoryService,
    fb: FormBuilder
  ) {
    super(fb);
  }
  ngOnInit(): void {
    this.setForm();
    this.initEditPage();
    this.setTableData();
    this.columnConfig = SupplierCostStructureTableConfig.getColumnConfig();
    this.displayedColumns = SupplierCostStructureTableConfig.getDisplayColumns();
  }

  protected load(): Observable<DfSupplierDirectoryMasterDto> {
    // Simulate loading data from a service
    return of(this.supplierInfo);
  }

  protected buildForm(data: DfSupplierDirectoryMasterDto): FormGroup {
    // Build the form using the loaded data
    this.form.patchValue({
      supplierId: data?.supplierId,
      interestRate: data?.interestRate,
      rentRate: data?.rentRate,
      carryingCostsForFinishedGoods: data?.carryingCostsForFinishedGoods,
      carryingCostsForPaymentTerms: data?.carryingCostsForPaymentTerms,
      carryingCostsForRawMaterial: data?.carryingCostsForRawMaterial,
      factoryOverhead: data?.factoryOverhead,
      materialOverhead: data?.materialOverhead,
      profitMargin: data?.profitMargin,
      materialProfitMargin: data?.materialProfitMargin,
      manufacturingProfitMargin: data?.manufacturingProfitMargin,
      sgAndA: data?.sgAndA,
    });
    return this.form;
  }

  protected saveApi(data: DfSupplierDirectoryMasterDto): Observable<any> {
    // Simulate saving data to a service
    Object.assign(this.supplierInfo, data);
    return this.digitalFactoryService.updateSupplierInfo(this.supplierInfo).pipe(takeUntil(this.unsubscribe$));
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  onRadioButtonChange(row: DfSupplierCostStructureDto) {
    this.selectedCostStructureCategory = row;
    this.changedValue = row.currentValue;
    this.selectedColumn = row.overheadKey;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }

  private setForm() {
    this.form = this.fb.group({
      supplierId: [Validators.required],
      interestRate: [Validators.required, Validators.min(0)],
      rentRate: [Validators.required, Validators.min(0)],
      carryingCostsForFinishedGoods: [Validators.required, Validators.min(0)],
      carryingCostsForPaymentTerms: [Validators.required, Validators.min(0)],
      carryingCostsForRawMaterial: [Validators.required, Validators.min(0)],
      factoryOverhead: [Validators.required, Validators.min(0)],
      materialOverhead: [Validators.required, Validators.min(0)],
      profitMargin: [Validators.required, Validators.min(0)],
      materialProfitMargin: [Validators.required, Validators.min(0)],
      manufacturingProfitMargin: [Validators.required, Validators.min(0)],
      sgAndA: [Validators.required, Validators.min(0)],
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onTableInputChange(_row: any) {
    this[_row.overheadKey] = _row.currentValue;
    this.isSaveEnabled = true;
  }
  private setTableData(): void {
    this.costStructureData = [
      // Parent row: Profit Margin
      {
        id: 1,
        overheadKey: null,
        overheadCategory: 'Profit Margin',
        currentValue: null,
        marketComparison: null,
        isGroup: true,
        parentKey: null,
      } as any,
      // Child rows under Profit Margin
      {
        id: 2,
        overheadKey: 'materialProfitMargin', // still using the same field
        overheadCategory: 'Material',
        currentValue: this.form.get('materialProfitMargin')?.value || 0,
        marketComparison: null,
        isGroup: false,
        parentKey: 'profitMargin',
      } as any,
      {
        id: 3,
        overheadKey: 'manufacturingProfitMargin',
        overheadCategory: 'Manufacturing',
        currentValue: this.form.get('manufacturingProfitMargin')?.value || 0,
        marketComparison: null,
        isGroup: false,
        parentKey: 'profitMargin',
      } as any,
      // Parent row: Overhead
      {
        id: 4,
        overheadKey: null,
        overheadCategory: 'Overhead',
        currentValue: null,
        marketComparison: null,
        isGroup: true,
        parentKey: null,
      } as any,
      // Child rows under Overhead
      {
        id: 5,
        overheadKey: 'materialOverhead',
        overheadCategory: 'Material',
        currentValue: this.form.get('materialOverhead')?.value || 0,
        marketComparison: null,
        isGroup: false,
        parentKey: 'overhead',
      } as any,
      {
        id: 6,
        overheadKey: 'factoryOverhead',
        overheadCategory: 'Factory',
        currentValue: this.form.get('factoryOverhead')?.value || 0,
        marketComparison: null,
        isGroup: false,
        parentKey: 'overhead',
      } as any,
      {
        id: 7,
        overheadKey: 'sgAndA',
        overheadCategory: 'SG & A',
        currentValue: this.form.get('sgA')?.value || 0,
        marketComparison: null,
        isGroup: false,
        parentKey: 'overhead',
      } as any,
      {
        id: 8,
        overheadKey: 'interestRate',
        overheadCategory: 'Borrowing Rate (Interest Rate)',
        currentValue: this.form.get('interestRate')?.value || 0,
        marketComparison: null,
      } as any,
    ];

    this.dataSource.data = this.costStructureData;
  }
  getMarketComparisonColor(row: DfSupplierCostStructureDto): 'green' | 'yellow' | 'red' {
    const value = row.currentValue;

    if (value == null || value === undefined) {
      return 'green'; // default if no value
    }

    if (value < 5) {
      return 'green';
    } else if (value < 8) {
      return 'yellow';
    } else {
      return 'red';
    }
  }
}
