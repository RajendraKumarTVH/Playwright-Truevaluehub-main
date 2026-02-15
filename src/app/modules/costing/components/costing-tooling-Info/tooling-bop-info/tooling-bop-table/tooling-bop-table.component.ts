import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-tooling-bop-table',
  templateUrl: './tooling-bop-table.component.html',
  styleUrls: ['./tooling-bop-table.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule],
})
export class ToolingBopTableComponent {
  @Input() compVals: any;
  @Input() canUpdate: boolean = false;
  @Input() bopInfoDefaultValues: any;
  @Output() editBopInfo = new EventEmitter<any>();
  @Output() deleteBopInfo = new EventEmitter<any>();
  @Output() addBopInfo = new EventEmitter<any>();

  addBOPSection(): void {
    this.addBopInfo.emit();
  }

  onEditBOPInfo(bop) {
    this.editBopInfo.emit(bop);
  }

  onDeleteBOPClick(bopCostId: number) {
    this.deleteBopInfo.emit(bopCostId);
  }
}
