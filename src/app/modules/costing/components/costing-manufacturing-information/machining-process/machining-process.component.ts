import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormArray, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { FieldCommentComponent } from 'src/app/modules/comments/components/field-comment-button/field-comment.component';
import { ManufacturingMachiningConfigService } from 'src/app/shared/config/manufacturing-machining-config';
import { OnlyNumber } from 'src/app/shared/directives';
import { AutoTooltipDirective } from 'src/app/shared/directives/auto-tooltip.directive';
import { ConfirmationDialogConfig, MessagingService } from 'src/app/messaging/messaging.service';
import { InfoTooltipComponent } from 'src/app/shared/components/info-tooltip/info-tooltip.component';

@Component({
  selector: 'app-machining-process',
  templateUrl: './machining-process.component.html',
  styleUrls: ['./machining-process.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FieldCommentComponent, OnlyNumber, MatIconModule, AutoTooltipDirective, InfoTooltipComponent],
})
export class MachiningProcessComponent implements OnChanges {
  @Input() formGroup: FormGroup;
  @Input() machiningVals: any;
  @Input() featureDetails: string;
  @Input() machiningOperationTypeFormArray: FormArray;
  @Output() doCalculateCost = new EventEmitter<any>();
  @Output() triggerOperation = new EventEmitter<any>();
  public showMachiningOperations = true;
  public operationVisible: boolean[] = [];
  public featureMap: Map<string, string> = new Map<string, string>();

  turningOperations = this._machiningConfig.turningProcesses;
  millingOperations = this._machiningConfig.millingOperations;

  constructor(
    private _machiningConfig: ManufacturingMachiningConfigService,
    private messaging: MessagingService
  ) {}

  ngOnChanges(_changes: SimpleChanges) {
    if (this.featureDetails && this.machiningOperationTypeFormArray) {
      const featureEntities = JSON.parse(this.featureDetails || '[]');

      this.featureMap = new Map();
      this.machiningOperationTypeFormArray?.controls.forEach((control) => {
        const featureId = control.get('featureId')?.value;
        const feature = featureEntities.find((x: any) => x.id === featureId);
        if (feature) {
          this.featureMap.set(feature.id, `${feature.setIndex + 1} - ${feature.serialNo?.trim()}`);
        }
      });
    }
  }

  calculateCost(fieldName = '') {
    this.doCalculateCost.emit({ fieldName });
  }

  triggerFunction(op: string, params: any[]) {
    op === 'operationTypeChange' && (this.operationVisible[params[1]] = true);

    if (op === 'deleteMachiningOperation') {
      const dialogRef = this.messaging.openConfirmationDialog(<ConfirmationDialogConfig>{
        data: {
          title: 'Confirm Delete Operation',
          message: 'Are you sure you want to delete this operation?',
          action: 'CONFIRM',
          cancelText: 'CANCEL',
        },
      });
      dialogRef.afterClosed().subscribe((canDelete) => {
        if (canDelete) {
          this.triggerOperation.emit({ functionName: op, params: [...params] });
        } else {
          return;
        }
      });
    } else {
      this.triggerOperation.emit({ functionName: op, params: [...params] });
    }
  }
}
