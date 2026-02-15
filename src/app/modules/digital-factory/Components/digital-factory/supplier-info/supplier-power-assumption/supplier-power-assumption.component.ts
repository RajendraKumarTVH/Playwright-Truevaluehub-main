import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ChartModule } from 'primeng/chart';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs/internal/Subject';
import { DfSupplierDirectoryMasterDto } from 'src/app/modules/digital-factory/Models/df-supplier-directory-master-dto';
import { DigitalFactoryService } from 'src/app/modules/digital-factory/Service/digital-factory.service';
import { MatIconModule } from '@angular/material/icon';
import { PowerSupplyValidations } from 'src/app/modules/digital-factory/Models/df-power-supply-validation';
import { EditPageBase } from '../../../Shared/edit-state/edit-page.base';
import { Observable, of } from 'rxjs';
import { EditToolbarComponent } from '../../../Shared/edit-toolbar/edit-toolbar.component';

@Component({
  selector: 'app-supplier-power-assumption',
  templateUrl: './supplier-power-assumption.component.html',
  styleUrls: ['./supplier-power-assumption.component.scss'],
  standalone: true,
  imports: [ChartModule, ReactiveFormsModule, CommonModule, MatTableModule, MatSortModule, MatIconModule, EditToolbarComponent],
})
export class SupplierPowerAssumptionComponent extends EditPageBase<DfSupplierDirectoryMasterDto> implements OnInit, OnDestroy {
  @Input() supplierInfo?: DfSupplierDirectoryMasterDto;
  displayedColumns: string[] = ['powerSource', 'totalSupplyPercentage', 'hourRate', 'esgImpact'];
  dataSource = new MatTableDataSource();
  columnWidths: { [key: string]: number } = {};
  @ViewChild(MatSort) sort!: MatSort;
  isSaveEnabled = false;
  form!: FormGroup;
  chartData: any;
  chartOptions: any;
  chartLegends: any = [];
  validationError?: PowerSupplyValidations;
  totalPortion?: number;

  private readonly unsubscribe$: Subject<undefined> = new Subject<undefined>();

  constructor(
    private readonly digitalFactoryService: DigitalFactoryService,
    fb: FormBuilder
  ) {
    super(fb);
  }

  ngOnInit() {
    this.dataSource.sort = this.sort;
    this.displayedColumns.forEach((column) => {
      this.columnWidths[column] = 150;
    });
    this.setForm();
    this.initEditPage();
    this.initChart();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  protected load(): Observable<DfSupplierDirectoryMasterDto> {
    return of(this.supplierInfo);
  }

  protected buildForm(data: DfSupplierDirectoryMasterDto): FormGroup {
    // Build the form using the loaded data
    this.form.patchValue({
      supplierId: this.supplierInfo?.supplierId,
      coalPortion: data?.coalPortion,
      windPortion: data?.windPortion,
      naturalGasPortion: data?.naturalGasPortion,
      nuclearPortion: data?.nuclearPortion,
      geothermalPortion: data?.geothermalPortion,
      otherNonRenewablePortion: data?.otherNonRenewablePortion,
      otherRenewablePortion: data?.otherRenewablePortion,
      totalPortion: this.getCalculateTotalPortion(),
    });
    return this.form;
  }

  protected saveApi(data: DfSupplierDirectoryMasterDto): Observable<any> {
    const totalValue = this.getCalculateTotalPortion();
    if (totalValue !== 100 && totalValue != 0) {
      this.validationError = PowerSupplyValidations.InComplete;
      return null;
    }
    this.validationError = undefined;
    data.coalPortion = this.form.get('coalPortion')?.value || 0;
    data.windPortion = this.form.get('windPortion')?.value || 0;
    data.naturalGasPortion = this.form.get('naturalGasPortion')?.value || 0;
    data.nuclearPortion = this.form.get('nuclearPortion')?.value || 0;
    data.geothermalPortion = this.form.get('geothermalPortion')?.value || 0;
    data.otherNonRenewablePortion = this.form.get('otherNonRenewablePortion')?.value || 0;
    data.otherRenewablePortion = this.form.get('otherRenewablePortion')?.value || 0;
    Object.assign(this.supplierInfo, data);
    return this.digitalFactoryService.updateSupplierInfo(this.supplierInfo).pipe(takeUntil(this.unsubscribe$));
  }

  protected afterSaveApi(data: DfSupplierDirectoryMasterDto): any {
    if (data) {
      this.supplierInfo = data;
    }
    this.initChart();
  }

  private initChart() {
    const chartColorInfo = {
      coal: '#A1B5FF',
      wind: '#587CC6',
      naturalGas: '#FF7E65',
      nuclear: '#5ED1B1',
      geothermal: '#F36FD5',
      otherNonRenewable: '#FFB024',
      otherRenewable: '#E54C71',
    };

    this.chartLegends = [
      {
        color: chartColorInfo.coal,
        key: 'coalPortion',
        name: 'Coal',
        value: this.supplierInfo?.coalPortion ?? '',
      },
      {
        color: chartColorInfo.wind,
        key: 'windPortion',
        name: 'Wind',
        value: this.supplierInfo?.windPortion ?? '',
      },
      {
        color: chartColorInfo.naturalGas,
        key: 'naturalGasPortion',
        name: 'Natural Gas',
        value: this.supplierInfo?.naturalGasPortion ?? '',
      },
      {
        color: chartColorInfo.nuclear,
        key: 'nuclearPortion',
        name: 'Nuclear',
        value: this.supplierInfo?.nuclearPortion ?? '',
      },
      {
        color: chartColorInfo.geothermal,
        key: 'geothermalPortion',
        name: 'Geothermal',
        value: this.supplierInfo?.geothermalPortion ?? '',
      },
      {
        color: chartColorInfo.otherNonRenewable,
        key: 'otherNonRenewablePortion',
        name: 'Other Non Renewable',
        value: this.supplierInfo?.otherNonRenewablePortion ?? '',
      },
      {
        color: chartColorInfo.otherRenewable,
        key: 'otherRenewablePortion',
        name: 'Other Renewable',
        value: this.supplierInfo?.otherRenewablePortion ?? '',
      },
    ];

    this.chartData = {
      labels: ['Coal', 'Wind', 'Natural Gas', 'Nuclear', 'Geothermal', 'Other Non Renewable', 'Other Renewable'],
      datasets: [
        {
          data: [
            this.supplierInfo?.coalPortion ?? '',
            this.supplierInfo?.windPortion ?? '',
            this.supplierInfo?.naturalGasPortion ?? '',
            this.supplierInfo?.nuclearPortion ?? '',
            this.supplierInfo?.geothermalPortion ?? '',
            this.supplierInfo?.otherNonRenewablePortion ?? '',
            this.supplierInfo?.otherRenewablePortion ?? '',
          ],
          backgroundColor: [
            chartColorInfo.coal,
            chartColorInfo.wind,
            chartColorInfo.naturalGas,
            chartColorInfo.nuclear,
            chartColorInfo.geothermal,
            chartColorInfo.otherNonRenewable,
            chartColorInfo.otherRenewable,
          ],
        },
      ],
    };

    this.chartOptions = {
      cutout: '60%',
      plugins: {
        legend: {
          display: false,
        },
      },
    };
    if (
      !this.supplierInfo?.coalPortion ||
      !this.supplierInfo?.windPortion ||
      !this.supplierInfo?.naturalGasPortion ||
      !this.supplierInfo?.nuclearPortion ||
      !this.supplierInfo?.geothermalPortion ||
      !this.supplierInfo?.otherNonRenewablePortion ||
      !this.supplierInfo?.otherNonRenewablePortion
    ) {
      this.validationError = PowerSupplyValidations.NoValue;
    }
  }

  private setForm() {
    this.form = this.fb.group({
      coalPortion: [0],
      windPortion: [0],
      naturalGasPortion: [0],
      nuclearPortion: [0],
      geothermalPortion: [0],
      otherNonRenewablePortion: [0],
      otherRenewablePortion: [0],
      totalPortion: [0],
    });
  }

  private getCalculateTotalPortion() {
    const coalPortion = Number(this.form.get('coalPortion')?.value) || 0;
    const windPortion = Number(this.form.get('windPortion')?.value) || 0;
    const naturalGasPortion = Number(this.form.get('naturalGasPortion')?.value) || 0;
    const nuclearPortion = Number(this.form.get('nuclearPortion')?.value) || 0;
    const geothermalPortion = Number(this.form.get('geothermalPortion')?.value) || 0;
    const otherNonRenewablePortion = Number(this.form.get('otherNonRenewablePortion')?.value) || 0;
    const otherRenewablePortion = Number(this.form.get('otherRenewablePortion')?.value) || 0;

    const totalValue = coalPortion + windPortion + naturalGasPortion + nuclearPortion + geothermalPortion + otherNonRenewablePortion + otherRenewablePortion;
    return Number.isNaN(totalValue) ? null : totalValue;
  }
}
