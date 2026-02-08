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
@Component({
  selector: 'app-injection-molding-material',
  imports: [NgbPopover, OnlyNumber, FieldCommentComponent, CommonModule, FieldCommentComponent, MatIconModule, AutoTooltipDirective, ReactiveFormsModule],
  templateUrl: './injection-molding-material.component.html',
  styleUrl: './injection-molding-material.component.scss',
})
export class InjectionMoldingMaterialComponent {
  @Input() formGroup: FormGroup;
  @Output() doCalculateCost = new EventEmitter<any>();
  @Output() dirtyCheckEvent = new EventEmitter<boolean>();
  @Input() injecMoldingVals: any;
  @Input() processFlags: any;
  @Input() defaultValues: any;
  public popoverHook: NgbPopover;
  popupUrl: any;
  popupName: any;
  lstdescriptions: any = (DescriptionJson as any).default;
  masterBatchColorList = this.plasticRubberConfigService.masterBatchColors;

  constructor(private plasticRubberConfigService: PlasticRubberConfigService) {}

  calculateCost(fieldName = '', index = 0) {
    this.doCalculateCost.emit({ fieldName, index });
  }

  onBlurEvent(event: any): void {
    const targetElement = event.target as HTMLInputElement;
    if (targetElement) {
      const formControlName = targetElement.getAttribute('formControlName');
      if (formControlName) {
        const control = this.formGroup.get(formControlName);
        if (control && control.dirty && control.touched) {
          const controlValue = control.value;
          this.doCalculateCost.emit({ fieldName: formControlName, fieldValue: control.value, index: 0 });
          if (formControlName === 'regrindAllowance' && controlValue === null) {
            this.formGroup.get(formControlName).setValue(this.defaultValues.regrindAllowance);
          }
        }
      }
    }
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
