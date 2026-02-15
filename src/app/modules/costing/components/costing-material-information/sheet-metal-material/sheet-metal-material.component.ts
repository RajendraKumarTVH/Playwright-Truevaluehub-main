import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { FieldCommentComponent } from 'src/app/modules/comments/components/field-comment-button/field-comment.component';
import { OnlyNumber } from 'src/app/shared/directives';
import { AutoTooltipDirective } from 'src/app/shared/directives/auto-tooltip.directive';
import { MessagingService } from 'src/app/messaging/messaging.service';
import { AppConfigurationService } from 'src/app/shared/services/app-configuration.service';
import { WeldingConfigService } from 'src/app/shared/config/welding-config';
import { InfoTooltipComponent } from 'src/app/shared/components/info-tooltip/info-tooltip.component';
import * as DescriptionJson from 'src/assets/descriptions.json';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { MaterialConfigService } from 'src/app/shared/config/cost-material-config';
import { CostingConfig } from '../../../costing.config';
import { TableModule } from 'primeng/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sheet-metal-material',
  imports: [
    OnlyNumber,
    FieldCommentComponent,
    CommonModule,
    FieldCommentComponent,
    MatIconModule,
    AutoTooltipDirective,
    ReactiveFormsModule,
    InfoTooltipComponent,
    NgbPopover,
    TableModule,
    MatTooltipModule,
    MultiSelectModule,
    FormsModule,
  ],
  templateUrl: './sheet-metal-material.component.html',
  styleUrl: './sheet-metal-material.component.scss',
})
export class SheetMetalMaterialComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Output() doCalculateCost = new EventEmitter<any>();
  @Output() dirtyCheckEvent = new EventEmitter<boolean>();
  @Output() viewUnfoldedPart = new EventEmitter<any>();
  @Output() viewNestingAlgo = new EventEmitter<void>();
  @Output() viewNestingAlgoNew = new EventEmitter<void>();
  @Input() sheetMetalVals: any;
  @Input() tab: string;
  @Input() processFlags: any;
  @Input() selectedMaterialDetails: any;
  @Input() defaultValues: any;

  formIdentifier = 'costing-material-information';
  typeOfWeldList = this._costingConfig.typeOfWelds();
  lstdescriptions: any = (DescriptionJson as any).default;
  public popoverHook: NgbPopover;
  popupUrl: any;
  popupName: any;
  isProduction: boolean = false;
  coatingGrade = this.materialConfigService.coatingGrade;
  collapsedSections: boolean[] = [];

  // Uncomment this when nesting type is implemented
  // availableParts = [
  //   {
  //     id: 1,
  //     partId: 'Part A',
  //     name: 'Part A',
  //     image: 'assets/images/no-image-available-thumb.png',
  //   },
  //   {
  //     id: 2,
  //     partId: 'Part B',
  //     name: 'Part B',
  //     image: 'assets/images/no-image-available-thumb.png',
  //   },
  //   {
  //     id: 3,
  //     partId: 'Part C',
  //     name: 'Part C',
  //     image: 'assets/images/no-image-available-thumb.png',
  //   },
  //   {
  //     id: 4,
  //     partId: 'Part D',
  //     name: 'Part D',
  //     image: 'assets/images/no-image-available-thumb.png',
  //   },
  //   {
  //     id: 5,
  //     partId: 'Part E',
  //     name: 'Part E',
  //     image: 'assets/images/no-image-available-thumb.png',
  //   },
  // ];

  // selectedParts: any[] = [];

  // // Dummy data for Nesting Part Details table (UI only)
  // nestingParts = [
  //   {
  //     id: 1,
  //     partId: 'Part A',
  //     projectNumber: 'Assembly project 2627',
  //     image: 'assets/images/no-image-available-thumb.png',
  //     partDescription: 'L angle',
  //     partMaterial: 'Copper',
  //     thickness: 100,
  //     width: 100,
  //     length: 100,
  //     annualVolume: 100,
  //   },
  //   {
  //     id: 2,
  //     partId: 'Part B',
  //     projectNumber: 'Assembly project 2627',
  //     image: 'assets/images/no-image-available-thumb.png',
  //     partDescription: 'L angle',
  //     partMaterial: 'Copper',
  //     thickness: 200,
  //     width: 200,
  //     length: 200,
  //     annualVolume: 200,
  //   },
  //   {
  //     id: 3,
  //     partId: 'Part C',
  //     projectNumber: 'Assembly project 2627',
  //     image: 'assets/images/no-image-available-thumb.png',
  //     partDescription: 'L angle',
  //     partMaterial: 'Copper',
  //     thickness: 120,
  //     width: 120,
  //     length: 120,
  //     annualVolume: 120,
  //   },
  // ];

  get f() {
    return this.formGroup.controls;
  }

  get weldingFormArray() {
    return this.formGroup?.controls?.materialPkgs as FormArray;
  }

  constructor(
    private _costingConfig: CostingConfig,
    private messaging: MessagingService,
    protected appConfigurationService: AppConfigurationService,
    private weldingConfigService: WeldingConfigService,
    private materialConfigService: MaterialConfigService
  ) {
    this.typeOfWeldList = this._costingConfig.typeOfWelds();
    this.isProduction = this.appConfigurationService.configuration.isProduction == 'true' ? true : false;
  }

  ngOnInit(): void {
    this.collapsedSections = this.weldingFormArray?.controls.map(() => true);
    if (this.formGroup) {
      const clampingAllownces = this.formGroup?.controls['partShape']?.value;
      if (clampingAllownces === 'Not Applicable') {
        this.formGroup.controls['runnerDia'].disable();
        this.formGroup.controls['runnerLength'].disable();
      } else {
        this.formGroup.controls['runnerDia'].enable();
        this.formGroup.controls['runnerLength'].enable();
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['sheetMetalVals'] && changes['sheetMetalVals'].currentValue) {
      if (this.weldingFormArray?.controls?.length <= 0) {
        this.addMoreWeld();
      } else {
        this.collapsedSections = this.weldingFormArray?.controls.map(() => true);
      }
    }
  }
  onBlurEvent(event: any): void {
    const targetElement = event.target as HTMLInputElement;
    if (targetElement) {
      const formControlName = targetElement.getAttribute('formControlName');
      if (formControlName) {
        const control = this.formGroup.get(formControlName);
        if (control && control.dirty && control.touched) {
          // const controlValue = control.value;
          this.doCalculateCost.emit({ fieldName: formControlName, fieldValue: control.value, index: 0 });
          // if (formControlName === 'utilisation' && controlValue === null) {
          //   this.formGroup.get(formControlName).setValue(this.defaultValues.utilisation);
          // }
          // if (formControlName === 'netWeight' && controlValue === null) {
          //   this.formGroup.get(formControlName).setValue(this.defaultValues.netWeight);
          // }
        }
      }
    }
  }

  toggleCollapse(index: number) {
    this.collapsedSections[index] = !this.collapsedSections[index];
  }

  calculateCost(fieldName = '', index = 0) {
    this.doCalculateCost.emit({ fieldName, index });
  }

  showUnfoldedPart() {
    this.viewUnfoldedPart.emit();
  }

  showNestingAlgo() {
    this.viewNestingAlgo.emit();
  }

  showNestingAlgoNew() {
    this.viewNestingAlgoNew.emit();
  }

  addMoreWeld() {
    this.weldingFormArray.push(this.weldingConfigService.weldingSubMaterialFormGroup());
  }

  onDeleteSubWeld(index: number) {
    if (this.weldingFormArray?.controls) {
      this.weldingFormArray.controls.splice(index, 1);
      this.calculateCost();
      this.dirtyCheckEvent.emit(true);
    }
  }

  showinfo(filterValue: string) {
    let objdesc;
    if (this.lstdescriptions && this.lstdescriptions?.length > 0) {
      objdesc = this.lstdescriptions?.find((item: { id: string }) => item.id.toLowerCase() === filterValue.toLowerCase());
    }

    if (objdesc != null) {
      this.popupUrl = objdesc.imageUrl;
      this.popupName = objdesc.descriptions?.replace(/\n/g, '<br>') || '';
    }
    this.popoverHook?.open();
  }

  public validateUnfoldLength(e: any) {
    const coilWidth = e.currentTarget.value;
    const unfold = Number(this.formGroup.controls['unfoldedWidth'].value);
    if (Number(unfold) > Number(coilWidth)) {
      this.messaging.openSnackBar(`Please enter the value greater than Unfolded Width.`, '', { duration: 5000 });
    }
    this.calculateCost();
  }

  onChangeClampingAllownces(e: any) {
    const clampingAllownces = e.currentTarget.value;
    if (clampingAllownces === 'Not Applicable') {
      this.formGroup.controls['runnerDia'].disable();
      this.formGroup.controls['runnerLength'].disable();
    } else {
      this.formGroup.controls['runnerDia'].enable();
      this.formGroup.controls['runnerLength'].enable();
    }
    this.calculateCost();
  }
}
