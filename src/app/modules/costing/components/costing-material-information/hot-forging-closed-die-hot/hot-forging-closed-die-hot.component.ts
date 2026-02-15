import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { FieldCommentComponent } from 'src/app/modules/comments/components/field-comment-button/field-comment.component';
import { OnlyNumber } from 'src/app/shared/directives';
import * as DescriptionJson from 'src/assets/descriptions.json';
import { MatIconModule } from '@angular/material/icon';
import { AutoTooltipDirective } from 'src/app/shared/directives/auto-tooltip.directive';
import { ToolingConfigService } from 'src/app/shared/config/cost-tooling-config';
import { InfoTooltipComponent } from 'src/app/shared/components/info-tooltip/info-tooltip.component';

@Component({
  selector: 'app-hot-forging-closed-die-hot',
  templateUrl: './hot-forging-closed-die-hot.component.html',
  styleUrls: ['./hot-forging-closed-die-hot.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, OnlyNumber, FieldCommentComponent, MatIconModule, AutoTooltipDirective, InfoTooltipComponent],
})
export class HotForgingClosedDieHotComponent {
  @Input() formGroup: FormGroup;
  @Input() compVals;
  @Output() doCalculateCost = new EventEmitter<any>();
  public popoverHook: NgbPopover;
  popupUrl: any;
  popupName: any;
  lstdescriptions: any = (DescriptionJson as any).default;

  constructor(public _toolConfig: ToolingConfigService) {}

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
      // this.popupShow = (this.popupUrl != '') ? true : false;
      this.popupName = objdesc.descriptions?.replace(/\n/g, '<br>') || '';
    }
    this.popoverHook?.open();
  }
}
