import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldCommentComponent } from 'src/app/modules/comments/components/field-comment-button/field-comment.component';
import { OnlyNumber } from 'src/app/shared/directives';
import { AutoTooltipDirective } from 'src/app/shared/directives/auto-tooltip.directive';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import * as DescriptionJson from 'src/assets/descriptions.json';
import { MatIconModule } from '@angular/material/icon';
import { InfoTooltipComponent } from 'src/app/shared/components/info-tooltip/info-tooltip.component';

@Component({
  selector: 'app-casting-process',
  templateUrl: './casting-process.component.html',
  styleUrls: ['./casting-process.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FieldCommentComponent, OnlyNumber, AutoTooltipDirective, NgbPopover, MatIconModule, InfoTooltipComponent],
})
export class CastingProcessComponent {
  @Input() formGroup: FormGroup;
  @Input() compVals: any;
  @Input() tab: string;
  @Output() doCalculateCost = new EventEmitter<any>();
  public popoverHook: NgbPopover;
  popupUrl: any;
  popupName: any;
  lstdescriptions: any = (DescriptionJson as any).default;

  get f() {
    return this.formGroup.controls;
  }
  onSliderRequiredChange() {
    this.formGroup.patchValue({
      platenSizeLength: 0,
      platenSizeWidth: 0,
    });
    this.calculateCost();
  }

  calculateCost(fieldName = '') {
    this.doCalculateCost.emit({ fieldName });
  }

  showinfo(filterValue: string) {
    let objdesc;
    if (this.lstdescriptions && this.lstdescriptions?.length > 0) {
      objdesc = this.lstdescriptions?.find((item: { id: string }) => item.id.toLowerCase() === filterValue.toLowerCase());
    }

    if (objdesc != null) {
      this.popupUrl = objdesc.imageUrl;
      // this.popupShow = (this.popupUrl != '') ? true : false;
      this.popupName = objdesc.descriptions?.replace(/\n/g, '<br>') || '';
    }
    this.popoverHook?.open();
  }
}
