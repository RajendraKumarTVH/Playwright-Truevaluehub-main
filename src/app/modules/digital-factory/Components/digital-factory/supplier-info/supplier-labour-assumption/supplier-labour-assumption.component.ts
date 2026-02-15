import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs/internal/Subject';
import { DfSupplierDirectoryMasterDto } from 'src/app/modules/digital-factory/Models/df-supplier-directory-master-dto';
import { DigitalFactoryService } from 'src/app/modules/digital-factory/Service/digital-factory.service';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs/internal/Observable';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { EditPageBase } from '../../../Shared/edit-state/edit-page.base';
import { of } from 'rxjs';
import { EditToolbarComponent } from '../../../Shared/edit-toolbar/edit-toolbar.component';
interface LabourRow {
  position: number;
  laborFormControlName: string;
  laborTypeFormControlName: string;
  labourCategory: string;
  examples: string;
  laborType: string;
  avgHourlyRate: number;
  marketComparison: 'low' | 'medium' | 'high';
}
@Component({
  selector: 'app-supplier-labour-assumption',
  templateUrl: './supplier-labour-assumption.component.html',
  styleUrls: ['./supplier-labour-assumption.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatTableModule, MatIconModule, MatAutocompleteModule, EditToolbarComponent],
})
export class SupplierLabourAssumptionComponent extends EditPageBase<DfSupplierDirectoryMasterDto> implements OnInit, OnDestroy {
  displayedColumns: string[] = ['edit', 'labourType', 'workersCount', 'hourRate'];
  dataSource = new MatTableDataSource();
  columnWidths: { [key: string]: number } = {};
  @Input() supplierInfo?: DfSupplierDirectoryMasterDto;
  @ViewChild(MatSort) sort!: MatSort;
  labourRows: LabourRow[] = [];
  isSaveEnabled = false;
  form!: FormGroup;
  // currently selected row
  selectedRowIndex = 0;
  selectedLabour: LabourRow;
  private readonly unsubscribe$: Subject<undefined> = new Subject<undefined>();

  // Remove following after integration
  fieldControl = new FormControl();
  filteredOptions: Observable<string[]>;
  options: string[] = ['One', 'Two', 'Three'];

  constructor(
    private readonly digitalFactoryService: DigitalFactoryService,
    fb: FormBuilder
  ) {
    super(fb);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }

  ngOnInit() {
    this.displayedColumns.forEach((column) => {
      this.columnWidths[column] = 150;
    });
    this.dataSource.sort = this.sort;
    this.setForm();
    this.initEditPage();
    this.setDataSource();
  }

  protected load(): Observable<DfSupplierDirectoryMasterDto> {
    return of(this.supplierInfo);
  }

  protected buildForm(data: DfSupplierDirectoryMasterDto): FormGroup {
    this.form.patchValue({
      laborLowSkilledCost: data?.laborLowSkilledCost,
      laborSemiSkilledCost: data?.laborSemiSkilledCost,
      laborSkilledCost: data?.laborSkilledCost,
      laborSpecialSkilledCost: data?.laborSpecialSkilledCost,
      laborQualityCost: data?.laborQualityCost,
      laborProgrammerCost: data?.laborProgrammerCost,
      laborToolDesignerCost: data?.laborToolDesignerCost,
      laborToolMakerCost: data?.laborToolMakerCost,
      selectedLaborCost: data?.laborLowSkilledCost,
    });
    return this.form;
  }

  protected saveApi(data: DfSupplierDirectoryMasterDto): Observable<any> {
    this.supplierInfo[this.selectedLabour.laborFormControlName] = this.form.get('selectedLaborCost')?.value;
    this.supplierInfo[this.selectedLabour.laborTypeFormControlName] = this.form.get('selectedLaborType')?.value;
    Object.assign(data, this.supplierInfo);
    return this.digitalFactoryService.updateSupplierInfo(this.supplierInfo).pipe(takeUntil(this.unsubscribe$));
  }

  protected afterSaveApi(data: DfSupplierDirectoryMasterDto): any {
    this.supplierInfo = data;
    this.setDataSource();
  }

  checkChanges(): void {
    this.isSaveEnabled = true;
  }

  private setForm() {
    this.form = this.fb.group({
      laborLowSkilledType: [],
      laborLowSkilledCost: [],
      laborSemiSkilledType: [],
      laborSemiSkilledCost: [],
      laborSkilledType: [],
      laborSkilledCost: [],
      laborSpecialSkilledType: [],
      laborSpecialSkilledCost: [],
      laborQualityType: [],
      laborQualityCost: [],
      laborProgrammerType: [],
      laborProgrammerCost: [],
      laborToolDesignerType: [],
      laborToolDesignerCost: [],
      laborToolMakerType: [],
      laborToolMakerCost: [],
      selectedLaborCost: [],
      selectedLaborType: [],
    });
  }

  private setDataSource(): void {
    if (!this.supplierInfo) return;
    this.labourRows = [
      {
        position: 1,
        laborFormControlName: 'laborLowSkilledCost',
        labourCategory: 'Low-Skilled Labour',
        examples: 'Loader, Cleaner, Helper',
        laborTypeFormControlName: 'laborLowSkilledType',
        laborType: 'FTE (Unionized)',
        avgHourlyRate: this.supplierInfo.laborLowSkilledCost,
        marketComparison: 'low',
      },
      {
        position: 2,
        laborFormControlName: 'laborSemiSkilledCost',
        labourCategory: 'Semi-Skilled Labour',
        examples: 'Machine Operator, Assembler',
        laborTypeFormControlName: 'laborSemiSkilledType',
        laborType: 'FTE (Non-Unionized)',
        avgHourlyRate: this.supplierInfo.laborSemiSkilledCost,
        marketComparison: 'medium',
      },
      {
        position: 3,
        laborFormControlName: 'laborSkilledCost',
        labourCategory: 'Skilled Labour',
        examples: 'Welder, Electrician, Mechanic',
        laborTypeFormControlName: 'laborSkilledType',
        laborType: 'Contract/Temp',
        avgHourlyRate: this.supplierInfo.laborSkilledCost,
        marketComparison: 'high',
      },
      {
        position: 4,
        laborFormControlName: 'laborSpecialSkilledCost',
        labourCategory: 'Special Skilled Labour',
        examples: 'CNC Operator, Robotics Technician',
        laborTypeFormControlName: 'laborSpecialSkilledType',
        laborType: 'FTE (Unionized)',
        avgHourlyRate: this.supplierInfo.laborSpecialSkilledCost,
        marketComparison: 'low',
      },
      {
        position: 5,
        laborFormControlName: 'laborQualityCost',
        labourCategory: 'Quality',
        examples: 'Quality Inspector, QA Technician',
        laborTypeFormControlName: 'laborQualityType',
        laborType: 'Contract/Temp',
        avgHourlyRate: this.supplierInfo.laborQualityCost,
        marketComparison: 'medium',
      },
      {
        position: 6,
        labourCategory: 'Programmer',
        laborFormControlName: 'laborProgrammerCost',
        examples: 'Software Developer, Application Coder',
        laborTypeFormControlName: 'laborProgrammerType',
        laborType: 'FTE (Non-Unionized)',
        avgHourlyRate: this.supplierInfo.laborProgrammerCost,
        marketComparison: 'high',
      },
      {
        position: 7,
        labourCategory: 'Tool Designer',
        laborFormControlName: 'laborToolDesignerCost',
        examples: 'CAD Tool Designer, Die Designer',
        laborTypeFormControlName: 'laborToolDesignerType',
        laborType: 'Contract/Temp',
        avgHourlyRate: this.supplierInfo.laborToolDesignerCost,
        marketComparison: 'medium',
      },
      {
        position: 8,
        labourCategory: 'Tool Maker',
        laborFormControlName: 'laborToolMakerCost',
        examples: 'Tool & Die Maker, Jig Builder',
        laborTypeFormControlName: 'laborToolMakerType',
        laborType: 'FTE (Unionized)',
        avgHourlyRate: this.supplierInfo.laborToolMakerCost,
        marketComparison: 'low',
      },
    ];
    this.onLabourRowSelect(this.labourRows[0], 0);
  }

  onLabourRowSelect(row: LabourRow, index: number): void {
    this.selectedLabour = row;
    this.selectedRowIndex = index;
    this.form.patchValue({
      selectedLaborCost: row.avgHourlyRate,
      selectedLaborType: row.laborType,
    });
  }
}
