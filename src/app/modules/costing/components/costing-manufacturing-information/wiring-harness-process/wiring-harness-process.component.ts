import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormGroup, FormBuilder, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MessagingService } from 'src/app/messaging/messaging.service';
import { FieldCommentComponent } from 'src/app/modules/comments/components/field-comment-button/field-comment.component';
import { ManufacturingConfigService } from 'src/app/shared/config/cost-manufacturing-config';
import { HarnessSubProcessTypes, WiringHarnessConfig } from 'src/app/shared/config/wiring-harness-config';
import { OnlyNumber } from 'src/app/shared/directives';
import { AutoTooltipDirective } from 'src/app/shared/directives/auto-tooltip.directive';

@Component({
  selector: 'app-wiring-harness-process',
  templateUrl: './wiring-harness-process.component.html',
  styleUrls: ['./wiring-harness-process.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FieldCommentComponent, MatIconModule, OnlyNumber, AutoTooltipDirective],
})
export class WiringHarnessProcessComponent implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() costingManufacturingInfoform: FormGroup;
  @Input() compVals: any;
  @Output() doCalculateCost = new EventEmitter<any>();
  @Output() actionEmitter = new EventEmitter<any>();

  wireSizeList: any[] = [];
  twistinLengthList: any[] = [];
  cableGaugeList: any[] = [];
  harnessSubProcessTypes = HarnessSubProcessTypes;
  routingComplexityList: any[] = [];
  Math = Math;
  wireGroups = [
    { key: 'formLength', label: 'Wire Length', count: 0 },
    { key: 'formHeight', label: 'Wire Length', count: 0 },
    { key: 'formPerimeter', label: 'Wire Length', count: 0 },
  ];
  segmentIndex: { start: number; end: number }[] = [];
  processTypeWithQuantityField: number[] = [
    HarnessSubProcessTypes.CuttingStrippingCrimping,
    HarnessSubProcessTypes.CuttingStrippingSealInsertionCrimping,
    HarnessSubProcessTypes.Unsheathing8AWGto4AWG,
    HarnessSubProcessTypes.Unsheathing4AWGto40AWG,
    HarnessSubProcessTypes.CuttingStrippingTinning,
    HarnessSubProcessTypes.RibbonCableCutting,
    HarnessSubProcessTypes.RibbonCableCuttingCrimping,
    HarnessSubProcessTypes.HSTInsertionShrinking,
    HarnessSubProcessTypes.ConduitTubeCuttingSlitting,
    HarnessSubProcessTypes.CopperBraidSteelWireHeavyDutyHSTCutting,
    HarnessSubProcessTypes.HeatShrinkTubeNylonBraidCutting,
    HarnessSubProcessTypes.ConduitTubePVCSleeveCutting,
    HarnessSubProcessTypes.TubeSleeveBraidInsertionFixing,
    HarnessSubProcessTypes.CuttingUnsheathingMulticoreCable,
  ];
  constructor(
    private _fb: FormBuilder,
    private _messaging: MessagingService,
    public _manufacturingConfig: ManufacturingConfigService,
    public _harnessCOnfig: WiringHarnessConfig
  ) {}
  ngOnInit(): void {
    this.wireSizeList = this._harnessCOnfig.getUltrasonicWireWeldingCycletime();
    this.twistinLengthList = this._harnessCOnfig.getBraidedShieldStrandsTwistingCycletime();
    this.cableGaugeList = this._harnessCOnfig.getCableGaugeList();
    this.routingComplexityList = this._harnessCOnfig.getLayoutComplexity();
    if (Number(this.subProcessFormArray?.controls[0]?.value?.subProcessTypeID) === HarnessSubProcessTypes.CableTwistingWithEndTaping) {
      this.validateTwistedPairs(0, true);
    }
  }

  get f() {
    return this.formGroup.controls;
  }

  get subProcessFormArray() {
    return this.f?.subProcessList as FormArray;
  }

  getCableLengthArray(index: number) {
    return (this.subProcessFormArray?.controls[index] as FormGroup<any>).get('cableLengthArray') as FormArray;
  }

  setLayoutForWiringHarness(event: any, index: number) {
    const existingArray = (this.subProcessFormArray.controls[index] as FormGroup<any>).get('cableLengthArray') as FormArray;
    existingArray.clear();
    const processType = event.currentTarget.value;
    (this.subProcessFormArray?.controls as FormGroup[])[index].patchValue(this._manufacturingConfig.getWireHarnessPatchValue());
    this.emitAction('onChangeSubProcess', processType, () => {});
    this.calculateCost();
  }

  showAdditionalLengthFields(event: any, index: number) {
    const noOfCables = Number(event.currentTarget.value);
    if (this.processTypeWithQuantityField?.includes(Number(this.subProcessFormArray?.controls[index]?.value?.subProcessTypeID))) {
      this.insertAdditionalEntriesBasedOnTotal(noOfCables, index);
    } else {
      this.insertAdditionalEntries(noOfCables, index);
    }
  }
  insertAdditionalEntries(noOfCables: number, index: number) {
    if (noOfCables > 0) {
      this.getCableLengthArray(index).clear();
      for (let i = 0; i < noOfCables; i++) {
        this.getCableLengthArray(index).push(this._fb.control(0));
      }
      if ([HarnessSubProcessTypes.TerminalCrimpingSCOpenBarrelFerrule].includes(Number(this.subProcessFormArray?.controls[index]?.value?.subProcessTypeID))) {
        for (let i = 0; i < noOfCables; i++) {
          this.getCableLengthArray(index).push(this._fb.control(0));
        }
      }
    } else if (noOfCables === 0) {
      this.getCableLengthArray(index).clear();
    }
  }

  insertAdditionalEntriesBasedOnTotal(noOfCables: number, index: number) {
    if (noOfCables > 0) {
      this.getCableLengthArray(index).clear();
      for (let i = 0; i < 2; i++) {
        this.getCableLengthArray(index).push(this._fb.control(0));
      }
    } else if (noOfCables === 0) {
      this.getCableLengthArray(index).clear();
    }
  }

  public onMachineDescChange(event: any) {
    this.emitAction('onMachineDescChange', event.currentTarget.value, () => {});
  }

  private emitAction(type: string, data: any, callback: (manufactureFormGroup?: FormGroup) => void): void {
    this.actionEmitter.emit({ type, data, callback });
  }

  addWiringHarnessSubProcess() {
    this.subProcessFormArray?.push(this._manufacturingConfig.manufactureFormGroup(this.compVals.selectedProcessInfoId, this.compVals.conversionValue, this.compVals.isEnableUnitConversion));
  }

  setNodePoints(event: any, index: number) {
    const noOfCableColor = Number(event.currentTarget.value);
    (this.subProcessFormArray.controls as FormGroup[])[index].patchValue({ noOfNodePoints: noOfCableColor * 2 });
  }

  onDeleteSubProcess(index: number) {
    if (this.subProcessFormArray?.controls) {
      this.subProcessFormArray.controls.splice(index, 1);
      this.emitAction('onDeleteSubProcess', null, () => {});
    }
  }

  validateAndCalculateCost(fieldName = '') {
    let noOfCables = Number(this.subProcessFormArray?.controls[0]?.value?.noOfBends);
    const quantity = this.subProcessFormArray?.controls[0]?.value?.cableLengthArray?.filter((_, index) => index % 2 === 1);
    const quantitySum = quantity?.reduce((acc, curr) => acc + curr, 0);
    const hasZero = quantity?.some((item) => item === 0);

    if (quantitySum > noOfCables) {
      this._messaging.openSnackBar(`Incorrect Input Values!! Please Verify.`, '', { duration: 5000 });
      const updatedArray = this.subProcessFormArray?.controls[0]?.value.cableLengthArray.map((value: number, index: number) => (index % 2 !== 0 ? 0 : value));
      this.subProcessFormArray?.controls[0]?.patchValue({
        cableLengthArray: updatedArray,
      });
      return;
    } else if (noOfCables != quantitySum && quantitySum > 0 && hasZero === false && noOfCables > quantitySum) {
      for (let i = 0; i < 2; i++) {
        this.getCableLengthArray(0).push(this._fb.control(0));
      }
    }
    this.doCalculateCost.emit({ fieldName });
  }
  calculateCost(fieldName = '') {
    if (this.processTypeWithQuantityField?.includes(Number(this.subProcessFormArray?.controls[0]?.value?.subProcessTypeID))) {
      this.validateAndCalculateCost(fieldName);
      return;
    }
    this.doCalculateCost.emit({ fieldName });
  }

  validateTwistedPairs(index: number, OnEdit: boolean = false) {
    const arr = this.getCableLengthArray(index);
    const formGroup = this.subProcessFormArray.at(index) as FormGroup;
    this.wireGroups[0].count = formGroup.get('formLength')?.value || 0;
    this.wireGroups[1].count = formGroup.get('formHeight')?.value || 0;
    this.wireGroups[2].count = formGroup.get('formPerimeter')?.value || 0;

    const length = Number(formGroup.get('formLength')?.value || 0);
    const height = Number(formGroup.get('formHeight')?.value || 0);
    const perimeter = Number(formGroup.get('formPerimeter')?.value || 0);
    const noOfTwistedPairs = Number(this.subProcessFormArray.controls[index].value?.noOfBends || 0);

    if (length === noOfTwistedPairs || height === noOfTwistedPairs || perimeter === noOfTwistedPairs) {
      formGroup.get('formLength')?.enable({ emitEvent: false });
      formGroup.get('formHeight')?.enable({ emitEvent: false });
      formGroup.get('formPerimeter')?.enable({ emitEvent: false });
      const fields = ['formLength', 'formHeight', 'formPerimeter'];
      fields.forEach((field) => {
        if (formGroup.get(field)?.value === noOfTwistedPairs) {
          fields
            .filter((f) => f !== field)
            .forEach((otherField) => {
              formGroup.get(otherField)?.disable({ emitEvent: false });
              formGroup.get(otherField)?.setValue(0, { emitEvent: false });
            });
        }
      });
    } else {
      formGroup.get('formLength')?.enable({ emitEvent: false });
      formGroup.get('formHeight')?.enable({ emitEvent: false });
      formGroup.get('formPerimeter')?.enable({ emitEvent: false });
    }
    const sum = length + height + perimeter;
    if (noOfTwistedPairs > 0 && sum !== noOfTwistedPairs) {
      this._messaging.openSnackBar(`Incorrect Input Values!! Please Verify.`, '', { duration: 5000 });
      arr.clear();
    } else {
      if (!OnEdit) {
        arr.clear();
      }
      this.buildCableLengthArray(index);
      this.restoreCableValues(index, arr?.value);
    }
  }

  buildCableLengthArray(index: number) {
    const arr = this.getCableLengthArray(index);
    this.segmentIndex = [];
    let currentIndex = 0;
    this.wireGroups.forEach((group) => {
      const start = currentIndex;
      for (let i = 0; i < group.count; i++) {
        arr.push(new FormControl(null));
        currentIndex++;
      }
      const end = currentIndex - 1;
      this.segmentIndex.push({ start, end });
    });
  }

  restoreCableValues(index: number, savedValues: number[]) {
    const arr = this.getCableLengthArray(index);
    const count2 = (this.subProcessFormArray.at(index) as FormGroup).get('formLength')?.value || 0;
    const count3 = (this.subProcessFormArray.at(index) as FormGroup).get('formHeight')?.value || 0;
    const count4 = (this.subProcessFormArray.at(index) as FormGroup).get('formPerimeter')?.value || 0;

    let offset = 0;
    for (let i = 0; i < count2; i++) {
      if (arr.at(offset + i)) {
        arr.at(offset + i).setValue(savedValues[offset + i]);
      }
    }
    offset += count2;
    for (let i = 0; i < count3; i++) {
      if (arr.at(offset + i)) {
        arr.at(offset + i).setValue(savedValues[offset + i]);
      }
    }
    offset += count3;
    for (let i = 0; i < count4; i++) {
      if (arr.at(offset + i)) {
        arr.at(offset + i).setValue(savedValues[offset + i]);
      }
    }
  }
}
