import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { FieldCommentComponent } from 'src/app/modules/comments/components/field-comment-button/field-comment.component';
import { MaterialCastingConfigService } from 'src/app/shared/config/material-casting-config';
import { OnlyNumber } from 'src/app/shared/directives';
import { MatTooltip } from '@angular/material/tooltip';
import { ConfirmationDialogConfig, MessagingService } from 'src/app/messaging/messaging.service';
import * as DescriptionJson from 'src/assets/descriptions.json';
import { AutoTooltipDirective } from 'src/app/shared/directives/auto-tooltip.directive';
import { InfoTooltipComponent } from 'src/app/shared/components/info-tooltip/info-tooltip.component';

@Component({
  selector: 'app-casting-material',
  templateUrl: './casting-material.component.html',
  styleUrls: ['./casting-material.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, OnlyNumber, FieldCommentComponent, NgbPopover, MatIconModule, MatTooltip, AutoTooltipDirective, InfoTooltipComponent],
})
export class CastingMaterialComponent implements OnChanges {
  @Input() formGroup: FormGroup;
  @Input() castingVals;
  @Input() tab: string;
  @Output() doCalculateCost = new EventEmitter<any>();
  @Output() dirtyCheckEvent = new EventEmitter<boolean>();

  lstdescriptions: any = (DescriptionJson as any).default;
  public popoverHook: NgbPopover;
  popupUrl: any;
  // popupShow: boolean = false;
  popupName: any;

  constructor(
    private materialCastingConfigService: MaterialCastingConfigService,
    private messaging: MessagingService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['castingVals'] && changes['castingVals'].currentValue) {
      if (this.sandForCoreFormArray?.controls?.length <= 0) {
        this.addMoreCore();
      }
    }
  }

  calculateCost(fieldName = '', index = 0) {
    this.doCalculateCost.emit({ fieldName, index });
  }

  get f() {
    return this.formGroup.controls;
  }
  get sandForCoreFormArray() {
    return this.formGroup?.controls?.materialPkgs as FormArray;
  }

  addMoreCore(cotsData: any = null) {
    const coreArray = [];
    if (cotsData && cotsData.length > 0) {
      cotsData.forEach((element: any, index: number) => {
        const coreData = element.Description.split(',').map((item) => item.split(':'));
        const coreRow = {
          coreCostDetailsId: 0,
          materialInfoId: 0,
          coreLength: Number(coreData.find((x) => x[0].toLowerCase().includes('length'))?.[1] || 0),
          coreWidth: Number(coreData.find((x) => x[0].toLowerCase().includes('width'))?.[1] || 0),
          coreHeight: Number(coreData.find((x) => x[0].toLowerCase().includes('height'))?.[1] || 0),
          coreShape: 1,
          coreArea: Number(coreData.find((x) => x[0].toLowerCase().includes('surface area'))?.[1] || 0),
          coreVolume: Number(coreData.find((x) => x[0].toLowerCase().includes('volume'))?.[1] || 0),
          noOfCore: element.Qty || 1,
          coreWeight: 0,
          coreSandPrice: 0,
          coreName: `Core ${index + 1}` || '',
        };
        coreRow.coreShape = Math.round(coreRow.coreLength * coreRow.coreWidth * coreRow.coreHeight) === Math.round(coreRow.coreVolume) ? 1 : 2; // 1 - Rectangular
        coreArray.push(coreRow);
      });
      coreArray.forEach((core: any) => {
        this.sandForCoreFormArray.push(this.materialCastingConfigService.sandForCoreFormGroup(0, core));
      });
    } else {
      const index = ((this.sandForCoreFormArray.at(-1)?.value?.coreName || '').match(/\d+$/)?.[0] | 0) + 1;
      this.sandForCoreFormArray.push(this.materialCastingConfigService.sandForCoreFormGroup(0, null, index));
    }
  }

  onDeleteSubCore(index: number) {
    if (this.sandForCoreFormArray?.controls) {
      const dialogRef = this.messaging.openConfirmationDialog(<ConfirmationDialogConfig>{
        data: {
          title: 'Confirm Delete Core',
          message: 'Are you sure you want to delete this core?',
          action: 'CONFIRM',
          cancelText: 'CANCEL',
        },
      });
      dialogRef.afterClosed().subscribe((canDelete) => {
        if (canDelete) {
          this.sandForCoreFormArray.controls.splice(index, 1);
          this.calculateCost();
          this.dirtyCheckEvent.emit(true);
        }
      });
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
}
