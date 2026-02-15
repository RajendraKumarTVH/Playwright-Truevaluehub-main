import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { map, Observable, startWith, Subject, takeUntil } from 'rxjs';
import { FieldCommentComponent } from 'src/app/modules/comments/components/field-comment-button/field-comment.component';
import { SelectionType } from 'src/app/shared/config/manufacturing-electronics-config';
import { OnlyNumber } from 'src/app/shared/directives';
import { BillOfMaterialDto, PartInfoDto, ProjectInfoDto } from 'src/app/shared/models';
import { ProjectInfoService } from 'src/app/shared/services';
import * as DescriptionJson from 'src/assets/descriptions.json';
import { CommodityType } from '../../../costing.config';
import { MessagingService } from 'src/app/messaging/messaging.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { AutoTooltipDirective } from 'src/app/shared/directives/auto-tooltip.directive';
import { MaterialPCBAConfigService } from 'src/app/shared/config/material-pcba-config';

@Component({
  selector: 'app-pcba-material',
  templateUrl: './electronics-pcba-material.component.html',
  styleUrls: ['./electronics-pcba-material.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FieldCommentComponent, OnlyNumber, MatFormFieldModule, MatSelectModule, MatInputModule, MatAutocompleteModule, AutoTooltipDirective],
})
export class ElectronicsPCBAMaterialComponent implements OnInit, OnChanges {
  constructor(
    private eleService: MaterialPCBAConfigService,
    private projIfoService: ProjectInfoService,
    private messaging: MessagingService
  ) {}
  @Input() formGroup: FormGroup;
  @Input() events: Observable<any>;
  @Output() doCalculateCost = new EventEmitter<any>();
  @Output() dirtyCheckEvent = new EventEmitter<boolean>();
  @Input() electroVals: any;
  @Input() processFlags: any;
  @Input() projectInfoList: ProjectInfoDto[];
  @Input() currentPart: PartInfoDto;
  @Input() billofMaterialList: BillOfMaterialDto[];
  public popoverHook: NgbPopover;
  popupUrl: any;
  popupName: any;
  lstdescriptions: any = (DescriptionJson as any).default;
  subProcessNamesList: any[] = [];
  mountingTechnology: any[] = [];
  applicationList: any[] = [];
  SolderPasteMaterialList: any[] = [];
  ConformalCoatingMaterialList: any[] = [];
  AdhesivePottingMaterialList: any[] = [];
  currentProcessType: number;
  flags = {
    ThroughHoleLine: false,
    Coating: false,
    AdhesivePotting: false,
    RoutingVScoring: false,
    SMTLine: false,
  };
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  filteredProjects$: Observable<ProjectInfoDto[]>;
  ngOnInit(): void {
    this.mountingTechnology = this.eleService.getMountingTechnology();
    this.applicationList = this.eleService.getApplication();
    this.SolderPasteMaterialList = this.eleService.getSolderPasteMaterialList();
    this.ConformalCoatingMaterialList = this.eleService.getConformalCoatingList();
    this.AdhesivePottingMaterialList = this.eleService.getAdhesivePottingList();
    this.filteredProjects$ = this.formGroup.controls['widthAllowance'].valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
  }

  private _filter(value: any): ProjectInfoDto[] {
    const filterValue = (typeof value === 'string' ? value : value?.projectName || '').toLowerCase();
    return this.projectInfoList?.filter((project) => project.projectName?.toLowerCase().includes(filterValue) || project.projectInfoId?.toString().toLowerCase().includes(filterValue));
  }

  displayFn(project: any): string {
    return project ? `${project.projectName} - ${project.projectInfoId}` : '';
  }

  ngOnChanges(_changes: SimpleChanges) {
    this.setForm();
  }

  calculateCost(fieldName = '', index = 0) {
    this.doCalculateCost.emit({ fieldName, index });
  }

  get f() {
    return this.formGroup.controls;
  }

  showinfo(filterValue: string) {
    let objdesc;
    if (this.lstdescriptions && this.lstdescriptions?.length > 0) {
      objdesc = this.lstdescriptions?.find((item: { id: string }) => item?.id?.toLowerCase() === filterValue?.toLowerCase());
    }

    if (objdesc != null) {
      this.popupUrl = objdesc.imageUrl;
      this.popupName = objdesc.descriptions?.replace(/\n/g, '<br>') || '';
    }
    this.popoverHook?.open();
  }

  setForm() {
    this.flags.ThroughHoleLine = Number(this.f.closingTime.value) === SelectionType.Yes;
    this.flags.SMTLine = Number(this.f.injectionTime.value) === SelectionType.Yes;
    this.flags.Coating = Number(this.f.holdingTime.value) === SelectionType.Yes;
    this.flags.AdhesivePotting = Number(this.f.coolingTime.value) === SelectionType.Yes;

    if (this.projectInfoList?.length > 0 && this.f.widthAllowance.value > 0) {
      const proj = this.projectInfoList?.find((x) => x.projectInfoId === Number(this.f.widthAllowance?.value)) || null;
      this.f?.widthAllowance?.setValue(proj);
    }
    const totalPartQty = this.billofMaterialList?.reduce((sum, item) => sum + item.partQty, 0);
    this.f?.flashVolume?.setValue(Math.round(totalPartQty));
    if (!this.flags.Coating) {
      this.f?.partsPerCoil?.setValue(0);
      this.f?.coilLength?.setValue(0);
      this.f?.grossVolumne?.setValue(0);
    }
    if (!this.flags.AdhesivePotting) {
      this.f?.scaleLoss?.setValue(0);
      this.f?.partOuterDiameter?.setValue(0);
      this.f?.partsPerCoil?.setValue(0);
      this.f?.coilWeight?.setValue(0);
    }
    this.calculateCost();
  }

  projectOptionSelected(event: any) {
    const selectedProject = event.option.value as ProjectInfoDto;
    const projId = Number(selectedProject.projectInfoId);
    this.projIfoService
      .getMaterialInputsByProjectId(projId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result: any) => {
        if (result && result?.partInfoList?.length > 0 && result?.partInfoList[0]?.commodityId === CommodityType.PrintedCircuitBoard) {
          const partInfo = result?.partInfoList[0];
          const materialInfo = partInfo?.materialInfos?.length > 0 ? partInfo?.materialInfos[0] : null;
          if (materialInfo) {
            this.f?.sheetLength?.setValue(materialInfo?.openingTime); //PCB length
            this.f?.sheetWidth?.setValue(materialInfo?.colorantPer); //PCB width
            this.f?.sheetThickness?.setValue(materialInfo?.closingTime); //Panel Length(mm)
            this.f?.inputBilletWidth?.setValue(materialInfo?.injectionTime); //Panel Width (mm)
            this.f?.totalCableLength?.setValue(materialInfo?.txtWindows); //No. of PCB'S/ARRAY
            this.calculateCost();
          }
        } else {
          this.messaging.openSnackBar(`Please Choose a Valid PCB Project Number.`, '', {
            duration: 5000,
          });
        }
      });
  }
}
