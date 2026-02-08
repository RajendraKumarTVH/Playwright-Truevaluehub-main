import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { MessagingService } from 'src/app/messaging/messaging.service';
import { AddBomDto } from 'src/app/shared/models/add-bom.model';
// import * as BomActions from 'src/app/modules/_actions/bom.action';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { BomInfoSignalsService } from 'src/app/shared/signals/bom-info-signals.service';

@Component({
  selector: 'app-add-bom',
  templateUrl: './add-bom.component.html',
  styleUrls: ['./add-bom.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDialogModule],
})
export class AddBomComponent implements OnInit {
  dialogMessage: string;
  dialogTitle: string;
  origin: string;
  dialogAction: string;
  showForm: boolean = false;
  partInfoId: number;
  projectInfoId: number;
  bomId: number;
  confirmButtonColor = 'accent';
  public formGroup: FormGroup;
  constructor(
    private _fb: FormBuilder,
    public dialogRef: MatDialogRef<AddBomComponent>,
    private _store: Store,
    private messaging: MessagingService,
    private bomInfoSignalsService: BomInfoSignalsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dialogMessage = data.message;
    this.dialogTitle = data.title;
    this.origin = data.origin;
    this.dialogAction = data.action;
    this.projectInfoId = data.projectInfoId;
    this.partInfoId = data.partInfoId;
    this.bomId = data.bomId;
    if (data.showForm) {
      this.showForm = data.showForm;
    }

    if (data.color) {
      this.confirmButtonColor = data.color;
    }
  }

  ngOnInit(): void {
    this.formGroup = this._fb.group({
      projectInfoId: this.projectInfoId,
      partInfoId: this.partInfoId,
      NewIntPartNumber: '',
    });
  }

  closeDialog() {
    this.dialogRef.close(false);
  }

  addBombuttonClicked(value: any) {
    if (value && !this.noWhitespaceValidator(value)) {
      const list = new AddBomDto();
      list.partInfoId = this.formGroup.controls['partInfoId'].value;
      list.projectInfoId = this.formGroup.controls['projectInfoId'].value;
      list.intPartNumber = this.formGroup.controls['NewIntPartNumber'].value.trim();
      if (this.origin === 'project-details') {
        // this._store.dispatch(new BomActions.AddBillOfMaterial(list));
        this.bomInfoSignalsService.addBillOfMaterial(list);
      } else {
        // this._store.dispatch(new BomActions.AddNewBillOfMaterial(list));
        this.bomInfoSignalsService.addNewBillOfMaterial(list);
      }
      this.messaging.openSnackBar(`Data has been saved successfully.`, '', { duration: 5000 });
      this.dialogRef.close(true);
    } else {
      this.messaging.openSnackBar(`Please Enter Part Number.`, '', { duration: 5000 });
    }
  }

  noWhitespaceValidator(value: any) {
    if (value) {
      const isWhitespace = value.trim().length === 0;
      return isWhitespace;
    }
    return false;
  }
}
