import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { MessagingService } from 'src/app/messaging/messaging.service';
import { BlockUiService, MaterialMasterService } from 'src/app/shared/services';
import { takeUntil } from 'rxjs/operators';
import { TypeOfCable } from 'src/app/modules/costing/costing.config';
import { Subject } from 'rxjs';
import { MaterialCategory } from 'src/app/shared/enums';
import { CommonModule } from '@angular/common';
import { OnlyNumber } from 'src/app/shared/directives';
import { FieldCommentComponent } from 'src/app/modules/comments/components/field-comment-button/field-comment.component';
import { DisableControlDirective } from 'src/app/shared/directives/disable-control.directive';
import { AutoTooltipDirective } from 'src/app/shared/directives/auto-tooltip.directive';

@Component({
  selector: 'app-custom-cable-material',
  templateUrl: './custom-cable-material.component.html',
  styleUrls: ['./custom-cable-material.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, OnlyNumber, FieldCommentComponent, DisableControlDirective, AutoTooltipDirective],
})
export class CustomCableMaterialComponent implements OnDestroy {
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  @Input() formGroup: FormGroup;
  @Input() costingMaterialInfoFormGroup: FormGroup;
  @Input() compVals;
  @Output() doCalculateCost = new EventEmitter<any>();
  @Output() actionEmitter = new EventEmitter<number>();

  constructor(
    private formbuilder: FormBuilder,
    public sharedService: SharedService,
    private messaging: MessagingService,
    private blockUiService: BlockUiService,
    private materialMasterService: MaterialMasterService
  ) {}

  calculateCost(fieldName = '', index = 0, customCableMarketDataDto?: any, materialCategory?: MaterialCategory, isAutomationEntry?: boolean) {
    if (customCableMarketDataDto && materialCategory && isAutomationEntry !== undefined) {
      this.doCalculateCost.emit({
        fieldName,
        index,
        customCableMarketDataDto,
        materialCategory,
        isAutomationEntry,
      });
    } else {
      this.doCalculateCost.emit({ fieldName, index });
    }
  }

  get f() {
    return this.formGroup.controls;
  }

  get sandForCoreFormArray() {
    return this.formGroup?.controls?.materialPkgs as FormArray;
  }

  public onTypeOfCableChange(event: any) {
    const cableType = Number(event.currentTarget.value);
    this.actionEmitter.emit(cableType);
  }

  showAdditionalInsulatorFields() {
    const noOfCable: number = Number(this.formGroup.controls['noOfCables'].value);
    const noOfCableInSimilarDia: number = Number(this.formGroup.controls['noOfCablesWithSameDia'].value);
    this.compVals.custom.noOfCableValid = noOfCable > 0 ? true : false;
    this.compVals.custom.noOfCableSimilarDia = noOfCableInSimilarDia > 0 ? true : false;

    if (noOfCableInSimilarDia > noOfCable) {
      this.formGroup.controls['noOfCablesWithSameDia'].setValue('');
      this.messaging.openSnackBar(`Num of Cables With Same Dia should be less or equal to Number of Cables.`, '', {
        duration: 5000,
      });
      this.compVals.custom.noOfCableValid = false;
      this.compVals.custom.noOfCableSimilarDia = false;
    }
    this.sandForCoreFormArray.clear();
    if (noOfCableInSimilarDia > 0 && noOfCable > 0) {
      const noOfRowsToBeAdded = this.sharedService.isValidNumber(noOfCable + 1 - noOfCableInSimilarDia + 1);
      for (let i = 0; i < noOfRowsToBeAdded - 1; i++) {
        const formGroup = this.formbuilder.group({
          coreCostDetailsId: 0,
          coreShape: 0,
          coreArea: 0,
          coreHeight: 0,
          coreLength: 0,
          coreVolume: 0,
          coreWeight: 0,
          coreWidth: 0,
          noOfCore: 1,
        });
        this.sandForCoreFormArray.push(formGroup);
      }
    }
    this.calculateCost();
  }

  setCableSheathingMaterial(event: any, index: number = 0, isMainCable: boolean = false) {
    const materialMasterId = Number(event.currentTarget.value);
    if (materialMasterId != 0 && this.compVals.currentPart?.mfrCountryId && this.compVals.currentPart?.mfrCountryId != 0) {
      // this.blockUiService.pushBlockUI('setCableSheathingMaterial');
      const marketMonth = this.compVals.currentPart.selectedMonth ?? this.compVals.selectedProject?.marketMonth ?? this.sharedService.getMarketMonth(this.compVals.selectedProject.marketQuarter);
      this.materialMasterService
        .getMaterialMarketDataByMarketQuarter(this.compVals.currentPart?.mfrCountryId, materialMasterId, marketMonth)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((marketData) => {
          if (marketData?.length > 0 && materialMasterId > 0) {
            this.materialMasterService
              .getMaterialMasterByMaterialMarketDataId(marketData[0].materialMarketId)
              .pipe(takeUntil(this.unsubscribe$))
              .subscribe((customCableMarketDataDto) => {
                this.calculateCost('', index, customCableMarketDataDto, MaterialCategory.Plastics, true);
                this.costingMaterialInfoFormGroup.controls['materialInfoId'].setValue(0);
                const conductor = Number(this.formGroup.controls['typeOfConductor'].value);
                const typeOfCable = Number(this.formGroup.controls['typeOfCable'].value);
                if (conductor > 0 && isMainCable) {
                  if (typeOfCable === TypeOfCable.SolidCore) {
                    this.addAdditionalEntryForConductors(conductor, marketMonth, index);
                    // } else {
                    //   this.blockUiService.popBlockUI('setCableSheathingMaterial');
                  }
                } else if (conductor > 0 && !isMainCable) {
                  this.addAdditionalEntryForConductors(conductor, marketMonth, index);
                  // } else {
                  //   this.blockUiService.popBlockUI('setCableSheathingMaterial');
                }
              });
          }
        });
    }
  }

  addAdditionalEntryForConductors(typeOfConductor: number, marketMonth: string, index: number = 0) {
    this.materialMasterService
      .getMaterialMarketDataByMarketQuarter(this.compVals.currentPart?.mfrCountryId, typeOfConductor, marketMonth)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((marketData) => {
        if (marketData?.length > 0 && typeOfConductor > 0) {
          this.materialMasterService
            .getMaterialMasterByMaterialMarketDataId(marketData[0].materialMarketId)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((customCableMarketDataDto) => {
              this.calculateCost('', index, customCableMarketDataDto, MaterialCategory.NonFerrous, true);
              this.costingMaterialInfoFormGroup.controls['materialInfoId'].setValue(0);
              this.blockUiService.popBlockUI('setCableSheathingMaterial');
            });
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }
}
