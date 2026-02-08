import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription } from 'rxjs';
import { SubProcessTypeInfoDto } from 'src/app/shared/models/subprocess-info.model';
import * as DescriptionJson from 'src/assets/descriptions.json';
import { ColdDieForgingSubProcess, ManufacturingForgingSubProcessConfigService } from 'src/app/shared/config/costing-manufacturing-forging-sub-process-config';
import { ForgingThreadDesignationDetails } from 'src/app/shared/models/forging-configs-model';
import { MaterialForgingConfigService } from 'src/app/shared/config/material-forging-config';
import { CommonModule } from '@angular/common';
import { OnlyNumber } from 'src/app/shared/directives';
import { FieldCommentComponent } from 'src/app/modules/comments/components/field-comment-button/field-comment.component';
import { MatIconModule } from '@angular/material/icon';
import { AutoTooltipDirective } from 'src/app/shared/directives/auto-tooltip.directive';
import { InfoTooltipComponent } from 'src/app/shared/components/info-tooltip/info-tooltip.component';

@Component({
  selector: 'app-forging-sub-process',
  templateUrl: './forging-sub-process.component.html',
  styleUrls: ['./forging-sub-process.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, OnlyNumber, FieldCommentComponent, MatIconModule, AutoTooltipDirective, InfoTooltipComponent],
})
export class ForgingSubProcessComponent implements OnInit, OnChanges {
  constructor(
    private _manufacturingForgingSubProcessConfigService: ManufacturingForgingSubProcessConfigService,
    private _materialForgingConfigService: MaterialForgingConfigService
  ) {}

  @Input() formGroup: FormGroup;
  @Output() doCalculateCost = new EventEmitter<any>();
  //@Output() onFormSubmit = new EventEmitter<any>();
  @Output() dirtyCheckEvent = new EventEmitter<boolean>();
  @Input() forgingVals: any;
  @Input() forging: any;
  private eventsSubscription: Subscription;
  @Input() events: Observable<void>;
  public popoverHook: NgbPopover;
  popupUrl: any;
  popupName: any;
  lstdescriptions: any = (DescriptionJson as any).default;
  subProcessNamesList: any[] = [];
  mountingTechnology: any[] = [];
  applicationList: any[] = [];
  currentProcessType: number;
  threadDesignationList: ForgingThreadDesignationDetails[] = [];
  isConveyourTypeOfOperation: boolean = false;
  public typeOfOperationList: any = [];
  @Output() subProcessChange = new EventEmitter<any>();

  ColdDieForgingSubProcess = ColdDieForgingSubProcess;
  ngOnInit(): void {
    this.threadDesignationList = this._materialForgingConfigService.getThreadDesignationDetails();

    this.setSubProcessTypes();
    this.eventsSubscription = this.events.subscribe(() => this.setSubProcessTypes());
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['forgingVals'] && changes['forgingVals'].currentValue) {
      if (this.subProcessFormArray?.controls?.length <= 0) {
        this.addMore();
      }
    }
  }

  setSubProcessTypes() {
    if (this.forging.coldForgingClosedDieCold || this.forging.coldColdHeadingForging) {
      // const currentProcess = this.forging.coldForgingClosedDieCold ? ProcessType.ClosedDieForging : 0;
      this.subProcessNamesList = this._manufacturingForgingSubProcessConfigService.getSubProcessList();
      if (this.subProcessFormArray?.length == 0) {
        const subprocess = new SubProcessTypeInfoDto();
        this.subProcessFormArray?.push(this._manufacturingForgingSubProcessConfigService.getDynamicFormGroup(subprocess));
      }
    }
  }
  onDeleteSubProcess(index: number) {
    if (this.subProcessFormArray?.controls) {
      this.subProcessFormArray.controls.splice(index, 1);
      this.calculateCost();
      this.dirtyCheckEvent.emit(true);
    }
  }
  // ngOnDestroy() {
  //   //this.eventsSubscription.unsubscribe();
  // }
  calculateCost(fieldName = '', index = 0) {
    this.doCalculateCost.emit({ fieldName, index });
    // this.subProcessChange.emit(this.subProcessFormArray);
  }

  get f() {
    return this.formGroup.controls;
  }

  get subProcessFormArray() {
    return this.formGroup.controls?.subProcessList as FormArray;
  }
  get formAryLen() {
    return this.subProcessFormArray?.controls?.length;
  }

  setFormBasedOnSubProcessType(event: any, index: number) {
    // const subProcessType = Number(event.currentTarget.value);
    (this.subProcessFormArray.controls as FormGroup[])[index].patchValue({
      lengthOfCut: 0,
      formHeight: 0,
      formLength: 0,
      formPerimeter: 0,
      blankArea: 0,
      hlFactor: 0,
      moldTemp: 0,
      workpieceInitialDia: 0,
      workpieceFinalDia: 0,
      workpieceOuterDia: 0,
      workpieceInnerDia: 1.2,
      formingForce: 0,
      partInitialDia: 0,
      finalGrooveDia: 0,
      widthOfCut: 0,
      totalDepOfCut: 0.6,
      wheelDiameter: 0,
    });
    this.calculateCost();
  }

  addMore() {
    const formGrp = (this.subProcessFormArray.controls as FormGroup[])[this.formAryLen - 1];
    if (formGrp?.value && !!formGrp.value?.subProcessTypeID) {
      const subprocess = new SubProcessTypeInfoDto();
      this.subProcessFormArray.push(this._manufacturingForgingSubProcessConfigService.getDynamicFormGroup(subprocess));
      //this.onFormSubmit.emit(false);
    }
  }

  // onCrossSectionChange(event: any) {
  //   // if (this.currentPart.commodityId === CommodityType.MetalForming) {
  //   //   if (this.machineInfoList != null && this.machineInfoList.length > 0) {
  //   //     let crossSection = this.costingManufacturingInfoform.controls['noOfBends'].value;
  //   //   }
  //   // }
  // }
  // onTypeOfOperationChange(event: any) {
  //   // this.selectedTypeOfOperationId = event.currentTarget.value;
  //   // this.lblChambertext = this.selectedTypeOfOperationId === 2 ? "Passage length" : "Chamber length";
  //   // this.isConveyourTypeOfOperation = event.currentTarget.value === "2" ? true : false;
  // }
}
