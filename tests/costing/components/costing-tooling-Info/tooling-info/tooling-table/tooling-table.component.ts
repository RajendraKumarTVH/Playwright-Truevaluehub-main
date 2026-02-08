import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ToolingConfigService } from 'src/app/shared/config/cost-tooling-config';

@Component({
  selector: 'app-tooling-table',
  templateUrl: './tooling-table.component.html',
  styleUrls: ['./tooling-table.component.scss'],
  standalone: true,
  imports: [MatIconModule, CommonModule, FormsModule, ReactiveFormsModule],
})
export class ToolingTableComponent {
  @Input() compVals: any;
  @Input() canUpdate: boolean = false;
  @Output() editToolingInfo = new EventEmitter<any>();
  @Output() deleteToolingInfo = new EventEmitter<any>();
  @Output() addToolingInfo = new EventEmitter<any>();

  constructor(public _toolConfig: ToolingConfigService) {}

  addTooling() {
    this.addToolingInfo.emit();
  }

  onEditToolInfo(tool) {
    this.editToolingInfo.emit(tool);
  }

  onDeleteToolClick(toolingId) {
    this.deleteToolingInfo.emit(toolingId);
  }
}
