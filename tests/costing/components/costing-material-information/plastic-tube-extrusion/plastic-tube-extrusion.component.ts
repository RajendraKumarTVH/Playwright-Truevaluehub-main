import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { FieldCommentComponent } from 'src/app/modules/comments/components/field-comment-button/field-comment.component';
import { OnlyNumber } from 'src/app/shared/directives';
import * as DescriptionJson from 'src/assets/descriptions.json';
import { MatIconModule } from '@angular/material/icon';
import { AutoTooltipDirective } from 'src/app/shared/directives/auto-tooltip.directive';
import { CommentFieldFormIdentifierModel } from 'src/app/shared/models/comment-field-model';

@Component({
  selector: 'app-plastic-tube-extrusion',
  templateUrl: './plastic-tube-extrusion.component.html',
  styleUrls: ['./plastic-tube-extrusion.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, OnlyNumber, FieldCommentComponent, NgbPopover, MatIconModule, AutoTooltipDirective],
})
export class PlasticTubeExtrusionComponent {
  @Input() formGroup: FormGroup;
  @Input() compVals;
  @Output() doCalculateCost = new EventEmitter<any>();
  public popoverHook: NgbPopover;
  popupUrl: any;
  popupName: any;
  lstdescriptions: any = (DescriptionJson as any).default;
  isEnableUnitConversion: any;
  conversionValue: any;
  labelRequired: any;
  formIdentifier: CommentFieldFormIdentifierModel;

  get f() {
    return this.formGroup.controls;
  }

  calculateCost(fieldName = '', index = 0) {
    this.doCalculateCost.emit({ fieldName, index });
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
