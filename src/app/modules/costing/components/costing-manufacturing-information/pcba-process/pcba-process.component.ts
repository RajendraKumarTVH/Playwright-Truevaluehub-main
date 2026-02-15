import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription } from 'rxjs';
import { CoatingTypes, ElectronicsConfigService, PottingTypes, RoutingVScoring, SMTTypes, ThroughHoleLineTypes } from 'src/app/shared/config/manufacturing-electronics-config';
import { SubProcessTypeInfoDto } from 'src/app/shared/models/subprocess-info.model';
import * as DescriptionJson from 'src/assets/descriptions.json';
import { ProcessType } from '../../../costing.config';
import { CommonModule } from '@angular/common';
import { FieldCommentComponent } from 'src/app/modules/comments/components/field-comment-button/field-comment.component';
import { MatIconModule } from '@angular/material/icon';
import { AutoTooltipDirective } from 'src/app/shared/directives/auto-tooltip.directive';
import { MaterialPCBAConfigService } from 'src/app/shared/config/material-pcba-config';

@Component({
  selector: 'app-pcba-process',
  templateUrl: './pcba-process.component.html',
  styleUrls: ['./pcba-process.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FieldCommentComponent, MatIconModule, AutoTooltipDirective],
})
export class PcbaProcessComponent implements OnInit, OnChanges, OnDestroy {
  constructor(
    private eleService: ElectronicsConfigService,
    private pcbaMaterialConfig: MaterialPCBAConfigService
  ) {}
  @Input() formGroup: FormGroup;
  @Output() doCalculateCost = new EventEmitter<any>();
  @Output() dirtyCheckEvent = new EventEmitter<boolean>();
  @Input() electroVals: any;
  @Input() processFlags: any;
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
  @Output() subProcessChange = new EventEmitter<any>();
  ngOnInit(): void {
    this.mountingTechnology = this.pcbaMaterialConfig.getMountingTechnology();
    this.applicationList = this.pcbaMaterialConfig.getApplication();
    this.setSubProcessTypes();
    this.eventsSubscription = this.events.subscribe(() => this.setSubProcessTypes());
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['electroVals'] && changes['electroVals'].currentValue) {
      if (this.subProcessFormArray?.controls?.length <= 0) {
        this.addMore();
      }
    }
  }

  setSubProcessTypes() {
    if (this.processFlags.ThroughHoleLine || this.processFlags.Coating || this.processFlags.AdhesivePotting || this.processFlags.RoutingVScoring || this.processFlags.SMTLine) {
      const currentProcess = this.processFlags.ThroughHoleLine
        ? ProcessType.ThroughHoleLine
        : this.processFlags.Coating
          ? ProcessType.Coating
          : this.processFlags.AdhesivePotting
            ? ProcessType.AdhesivePotting
            : this.processFlags.RoutingVScoring
              ? ProcessType.RoutingVScoring
              : this.processFlags.SMTLine
                ? ProcessType.SMTLine
                : 0;
      this.subProcessNamesList = this.eleService.getSubProcessList(currentProcess);
      if (this.subProcessFormArray?.length == 0) {
        const subprocess = new SubProcessTypeInfoDto();
        this.subProcessFormArray?.push(this.eleService.getDynamicFormGroup(subprocess, this.processFlags));
      }
    }
  }

  ngOnDestroy() {
    this.eventsSubscription.unsubscribe();
  }
  calculateCost(fieldName = '', index = 0) {
    this.doCalculateCost.emit({ fieldName, index });
    this.subProcessChange.emit(this.subProcessFormArray);
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

  setFormBasedOnSubProcessType(event: any, index: number) {
    const subProcessType = Number(event.currentTarget.value);
    (this.subProcessFormArray.controls as FormGroup[])[index].patchValue({
      isThroughHoleLine:
        [
          ThroughHoleLineTypes.AxialCompManualPreforming,
          ThroughHoleLineTypes.AxialCompSemiPreforming,
          ThroughHoleLineTypes.RadialComponentManualPreforming,
          ThroughHoleLineTypes.RadialComponentSemiPreforming,
          ThroughHoleLineTypes.AxialCompAutoPlacement,
          ThroughHoleLineTypes.AxialCompManualPlacement,
          ThroughHoleLineTypes.RadialCompAutoPlacement,
          ThroughHoleLineTypes.RadialCompManualPlacement,
          ThroughHoleLineTypes.CustomCompManualPlacement,
          ThroughHoleLineTypes.WaveSoldering,
          ThroughHoleLineTypes.HandSoldering,
          ThroughHoleLineTypes.SelectiveSoldering,
          ThroughHoleLineTypes.Pressfit,
          ThroughHoleLineTypes.Washing,
        ].includes(subProcessType) && this.processFlags.ThroughHoleLine,

      isCoating: [CoatingTypes.ConformalCoatInspection, CoatingTypes.ConformalCoating, CoatingTypes.UVLightCuringSystem].includes(subProcessType) && this.processFlags.Coating,

      isConformalCoatInspection: subProcessType === CoatingTypes.ConformalCoatInspection && this.processFlags.Coating,
      isConformalCoating: subProcessType === CoatingTypes.ConformalCoating && this.processFlags.Coating,
      isUVLightCuringSystem: subProcessType === CoatingTypes.UVLightCuringSystem && this.processFlags.Coating,

      isAdhesivePotting: [PottingTypes.PottingMaterial, PottingTypes.UVLightCuringSystem].includes(subProcessType) && this.processFlags.AdhesivePotting,
      isPottingMaterial: subProcessType === PottingTypes.PottingMaterial && this.processFlags.AdhesivePotting,
      isUVLightCuring: subProcessType === PottingTypes.UVLightCuringSystem && this.processFlags.AdhesivePotting,

      isRoutingVScoring: [RoutingVScoring.DepanelTabRouting, RoutingVScoring.DepanelVscoring].includes(subProcessType) && this.processFlags.RoutingVScoring,

      isSMTLine:
        [
          SMTTypes.InLoader,
          SMTTypes.SolderPastePrinting,
          SMTTypes.SolderPasteInspection,
          SMTTypes.PickAndPlaceHighSpeed,
          SMTTypes.PickAndPlaceHighFlexibility,
          SMTTypes.PickAndPlaceMultifunctionalHead,
          SMTTypes.ReflowSoldering,
          SMTTypes.AOI,
          SMTTypes.UnLoader,
          SMTTypes.ConveyorFlipConveyor,
          SMTTypes.HighSpeedPickAandPlace,
          SMTTypes.HighFlexibilityPickAndPlace,
          SMTTypes.MultifunctionalHeadPickAndPlace,
        ].includes(subProcessType) && this.processFlags.SMTLine,
    });
    this.calculateCost();
  }

  onDeleteSubProcess(index: number) {
    if (this.subProcessFormArray?.controls) {
      this.subProcessFormArray.controls.splice(index, 1);
      this.calculateCost();
      this.dirtyCheckEvent.emit();
    }
  }

  addMore() {
    const formGrp = (this.subProcessFormArray.controls as FormGroup[])[this.formAryLen - 1];
    if (formGrp?.value && !!formGrp.value?.subProcessTypeID) {
      const subprocess = new SubProcessTypeInfoDto();
      this.subProcessFormArray.push(this.eleService.getDynamicFormGroup(subprocess, this.processFlags));
    }
  }
}
