import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { FieldCommentComponent } from 'src/app/modules/comments/components/field-comment-button/field-comment.component';
import { OnlyNumber } from 'src/app/shared/directives';
import * as DescriptionJson from 'src/assets/descriptions.json';
import { AutoTooltipDirective } from 'src/app/shared/directives/auto-tooltip.directive';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-compression-molding',
  templateUrl: './compression-molding.component.html',
  styleUrls: ['./compression-molding.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, OnlyNumber, FieldCommentComponent, AutoTooltipDirective, MatIconModule, NgbPopover],
})
export class CompressionMoldingComponent {
  @Input() formGroup: FormGroup;
  @Output() doCalculateCost = new EventEmitter<any>();
  @Output() dirtyCheckEvent = new EventEmitter<boolean>();
  @Input() parameters: any;
  public popoverHook: NgbPopover;
  popupUrl: any;
  popupName: any;
  lstdescriptions: any = (DescriptionJson as any).default;

  calculateCost(fieldName = '', index = 0) {
    this.doCalculateCost.emit({ fieldName, index });
  }

  showinfo(filterValue: string) {
    let objdesc;
    if (this.lstdescriptions && this.lstdescriptions?.length > 0) {
      objdesc = this.lstdescriptions?.find((item: { id: string }) => item.id.toLowerCase() === filterValue.toLowerCase());
    }

    if (objdesc !== null) {
      this.popupUrl = objdesc.imageUrl;
      this.popupName = objdesc.descriptions?.replace(/\n/g, '<br>') || '';
    }
    this.popoverHook?.open();
  }
}
