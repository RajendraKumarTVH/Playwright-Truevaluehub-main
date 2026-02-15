import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs/internal/Subject';
import { DfSupplierDirectoryMasterDto } from 'src/app/modules/digital-factory/Models/df-supplier-directory-master-dto';
import { DigitalFactoryService } from 'src/app/modules/digital-factory/Service/digital-factory.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { AutoTooltipDirective } from 'src/app/shared/directives/auto-tooltip.directive';
import { EditPageBase } from '../../../Shared/edit-state/edit-page.base';
import { Observable, of } from 'rxjs';
import { EditToolbarComponent } from '../../../Shared/edit-toolbar/edit-toolbar.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DigitalFactoryCommonService } from '../../../Shared/digital-factory-common-service';

@Component({
  selector: 'app-supplier-factory-assumption',
  templateUrl: './supplier-factory-assumption.component.html',
  styleUrls: ['./supplier-factory-assumption.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatAutocompleteModule, MatIconModule, AutoTooltipDirective, EditToolbarComponent, MatFormFieldModule, MatInputModule],
})
export class SupplierFactoryAssumptionComponent extends EditPageBase<DfSupplierDirectoryMasterDto> implements OnInit, OnDestroy {
  @Input() supplierInfo?: DfSupplierDirectoryMasterDto;
  form!: FormGroup;
  marketComparisonValue: number = 50;
  private readonly unsubscribe$: Subject<undefined> = new Subject<undefined>();

  constructor(
    private readonly digitalFactoryService: DigitalFactoryService,
    private readonly digitalFactoryCommonService: DigitalFactoryCommonService,
    readonly fb: FormBuilder
  ) {
    super(fb);
  }

  ngOnInit(): void {
    this.setForm();
    this.initEditPage();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }

  load(): Observable<DfSupplierDirectoryMasterDto> {
    return of(this.supplierInfo);
  }
  buildForm(data: DfSupplierDirectoryMasterDto): FormGroup {
    this.form.patchValue({
      supplierId: this.supplierInfo?.supplierId,
      shiftsPerDay: data?.shiftsPerDay,
      hoursPerShift: data?.hoursPerShift,
      workingDaysPerYear: data?.workingDaysPerYear,
      totalBreaksPerShift: data?.totalBreaksPerShift,
      factoryTotalSize: data?.factoryTotalSize,
      factoryType: data?.factoryType,
      totalAnualHours: data?.annualHours,
    });
    return this.form;
  }
  saveApi(data: DfSupplierDirectoryMasterDto): Observable<any> {
    data.annualHours = this.calculateTotalAnualHours();
    Object.assign(this.supplierInfo, data);
    this.form.patchValue({
      totalAnualHours: data.annualHours,
    });
    this.digitalFactoryCommonService.factoryHoursUpdated$.next(this.supplierInfo);
    return this.digitalFactoryService.updateSupplierInfo(this.supplierInfo).pipe(takeUntil(this.unsubscribe$));
  }

  private setForm() {
    this.form = this.fb.group({
      supplierId: [],
      shiftsPerDay: [Validators.required],
      hoursPerShift: [[Validators.required, Validators.min(1)]],
      workingDaysPerYear: [[Validators.required, Validators.min(0)]],
      totalBreaksPerShift: [[Validators.required, Validators.min(0)]],
      factoryTotalSize: [[Validators.required, Validators.min(0)]],
      factoryType: [],
      totalAnualHours: [{ value: 0, disabled: true }],
    });
  }

  private calculateTotalAnualHours() {
    const hoursPerShift = this.form.get('hoursPerShift')?.value || 0;
    const shiftsPerDay = this.form.get('shiftsPerDay')?.value || 0;
    const workingDaysPerYear = this.form.get('workingDaysPerYear')?.value || 0;
    const totalBreaksPerShift = this.form.get('totalBreaksPerShift')?.value || 0;
    return Math.floor((hoursPerShift * shiftsPerDay - totalBreaksPerShift / 60) * workingDaysPerYear);
  }

  getMarketComparisonColor(): string {
    // Dummy logic for gauge color - adjust based on marketComparisonValue
    if (this.marketComparisonValue < 33) return 'low';
    if (this.marketComparisonValue < 66) return 'medium';
    return 'high';
  }
}
