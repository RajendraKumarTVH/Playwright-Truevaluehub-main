import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ToolingOverheadMappingService } from 'src/app/shared/mapping/tooling-overhead-mapping.service';
import { CostOverHeadProfitDto } from 'src/app/shared/models/overhead-Profit.model';
import * as OverheadActions from 'src/app/modules/_actions/overhead-profit.action';
import { MessagingService } from 'src/app/messaging/messaging.service';
import { Store } from '@ngxs/store';
import { OnlyNumber } from 'src/app/shared/directives';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-overhead-info',
  templateUrl: './tooling-overhead-info.component.html',
  styleUrls: ['./tooling-overhead-info.component.scss'],
  standalone: true,
  imports: [OnlyNumber, FormsModule, CommonModule, ReactiveFormsModule],
})
export class ToolingOverheadInfoComponent {
  @Input() formGroup: FormGroup;
  @Input() compVals: any;
  @Output() doCalculateCost = new EventEmitter<any>();
  @Output() actionEmitter = new EventEmitter<any>();

  public isShowOverHead: boolean = true;
  public OverHeadIcon: string = 'remove_circle';

  constructor(
    private _OHMapper: ToolingOverheadMappingService,
    private messaging: MessagingService,
    private _store: Store
  ) {}

  public setOHForm() {
    if (this.compVals.costOverHeadProfitobj && this.compVals.costOverHeadProfitobj?.costOverHeadProfitId) {
      const total = (this.compVals.costOverHeadProfitobj?.mohCost || 0) + (this.compVals.costOverHeadProfitobj?.fohCost || 0) + (this.compVals.costOverHeadProfitobj?.sgaCost || 0);
      this.formGroup.patchValue(this._OHMapper.setOHFormPatch(this.compVals.costOverHeadProfitobj, total));
    }
  }

  clickIcon(section: string) {
    if (section == 'OverHead') {
      if (this.OverHeadIcon == 'add_circle') {
        this.OverHeadIcon = 'remove_circle';
        this.isShowOverHead = true;
      } else if (this.OverHeadIcon == 'remove_circle') {
        this.OverHeadIcon = 'add_circle';
        this.isShowOverHead = false;
      }
    }
  }

  public onOverHeadSubmit(): Observable<CostOverHeadProfitDto> {
    let model = new CostOverHeadProfitDto();
    model = this._OHMapper.onOverHeadSubmitPayLoad(this.formGroup, this.compVals.currentPart?.partInfoId, this.compVals.selectedToolId);
    if (model?.costOverHeadProfitId > 0) {
      this.emitAction('saveColoringInfo');
      this._store.dispatch(new OverheadActions.UpdateOverHeadProfit(model));
      this.messaging.openSnackBar(`Data updated successfully.`, '', { duration: 5000 });
    } else {
      this._store.dispatch(new OverheadActions.CreateOverHeadProfit(model));
    }
    return new Observable((obs) => {
      obs.next(model);
    });
  }

  calculateOHCost() {
    this.doCalculateCost.emit({});
  }

  private emitAction(type: string): void {
    this.actionEmitter.emit({ type });
  }
}
