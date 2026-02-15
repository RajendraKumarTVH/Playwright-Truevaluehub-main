import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TableModule } from 'primeng/table';
import { MaterialModule } from 'src/app/shared/material.module';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-delete-pcb-bom-modal',
  imports: [TableModule, DropdownModule, MaterialModule, FormsModule, CommonModule, CheckboxModule],
  templateUrl: './delete-pcb-bom-modal.component.html',
  styleUrl: './delete-pcb-bom-modal.component.scss',
})
export class DeletePcbBomModalComponent {
  @Input() boardComponents: any[] = [];
  @Input() bomStatus: any[] = [];
  @Input() subCommodityList: any[] = [];
  @Input() standardCustomList: any[] = [];
  @Input() partStatusList: any[] = [];

  selectedItems: { [key: string]: boolean } = {};

  constructor(
    public activeModal: NgbActiveModal,
    public _shareService: SharedService
  ) {}

  isAllSelected(): boolean {
    return this.boardComponents.every((item: any) => this.selectedItems[item.bomId]);
  }

  toggleSelectAll(checked: boolean): void {
    this.boardComponents.forEach((item: any) => {
      this.selectedItems[item.bomId] = checked;
    });
  }

  fieldsChange(values: any, item: any): void {
    console.log(values.currentTarget.checked, item);
    // this.selectedItems = this.boardComponents
    // .filter(item => item.selected)
    // .map(item => item.mpn);
  }

  onCancel(): void {
    this.activeModal.dismiss();
  }

  onDelete(): void {
    const selectedIds = Object.keys(this.selectedItems).filter((id) => this.selectedItems[id]);
    this.activeModal.close(selectedIds);
  }
}
