import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { FieldCommentComponent } from 'src/app/modules/comments/components/field-comment-button/field-comment.component';
import { OnlyNumber } from 'src/app/shared/directives';
import { AutoTooltipDirective } from 'src/app/shared/directives/auto-tooltip.directive';
import * as DescriptionJson from 'src/assets/descriptions.json';
import { PlasticRubberConfigService } from 'src/app/shared/config/plastic-rubber-config.service';
import { InfoTooltipComponent } from 'src/app/shared/components/info-tooltip/info-tooltip.component';

@Component({
  selector: 'app-compression-molding-material',
  imports: [NgbPopover, OnlyNumber, FieldCommentComponent, CommonModule, FieldCommentComponent, MatIconModule, AutoTooltipDirective, ReactiveFormsModule, InfoTooltipComponent],
  templateUrl: './compression-molding-material.component.html',
  styleUrl: './compression-molding-material.component.scss',
})
export class CompressionMoldingMaterialComponent {
  @Input() formGroup: FormGroup;
  @Output() doCalculateCost = new EventEmitter<any>();
  @Output() dirtyCheckEvent = new EventEmitter<boolean>();
  @Input() compressionMoldingVals: any;
  @Input() tab: string;
  @Input() processFlags: any;
  @Input() selectedMaterialDetails: any;

  public popoverHook: NgbPopover;
  popupUrl: any;
  popupName: any;
  lstdescriptions: any = (DescriptionJson as any).default;
  formIdentifier = 'costing-material-information';

  thermoStdSheetLengthList = this.plasticRubberConfigService.thermoStdSheetLengthList;
  thermoStdSheetWidthList = this.plasticRubberConfigService.thermoStdSheetWidthList;

  constructor(private plasticRubberConfigService: PlasticRubberConfigService) {}

  calculateCost(fieldName = '', index = 0) {
    this.doCalculateCost.emit({ fieldName, index });
  }

  get f() {
    return this.formGroup.controls;
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
