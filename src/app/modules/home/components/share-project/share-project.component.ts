import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material.module';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { SelectedProjectUser } from 'src/app/modules/settings/models';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MultiSelectComponent } from 'src/app/shared/components/multi-select/multi-select.component';

@Component({
  selector: 'app-share-project',
  imports: [CommonModule, FormsModule, MatSelectModule, MultiSelectComponent, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MaterialModule],

  templateUrl: './share-project.component.html',
  styleUrl: './share-project.component.scss',
  standalone: true,
})
export class ShareProjectComponent {
  selectedUsers = new FormControl([]);
  sharedUsersList: SelectedProjectUser[];
  selectedUsersList: any[] = [];
  dialogTitle: string = '';
  placeHolder: string = 'Select Users...';
  constructor(
    private _mdr: MatDialogRef<ShareProjectComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      usersList: SelectedProjectUser[];
      title: string;
    }
  ) {
    this.sharedUsersList = data.usersList;
    this.dialogTitle = data.title;
  }

  closeDialog() {
    this._mdr.close(false);
  }

  onSelectionChange(selectedItems: any[]) {
    this.selectedUsersList = selectedItems;
    console.log('selected items:', selectedItems);
  }
  onSave() {
    this._mdr.close(this.selectedUsersList);
  }
}
