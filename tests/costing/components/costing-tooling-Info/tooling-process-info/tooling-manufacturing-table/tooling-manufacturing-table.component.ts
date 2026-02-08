import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges, OnChanges } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { ToolingConfigService } from 'src/app/shared/config/cost-tooling-config';
import { CostingToolingProcessConfigService } from 'src/app/shared/config/costing-tooling-process-config.service';

@Component({
  selector: 'app-tooling-manufacturing-table',
  templateUrl: './tooling-manufacturing-table.component.html',
  styleUrls: ['./tooling-manufacturing-table.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule],
})
export class ToolingManufacturingTableComponent implements OnChanges {
  @Input() compVals: any;
  @Input() canUpdate: boolean = false;
  @Output() editProcessInfo = new EventEmitter<any>();
  @Output() deleteProcessInfo = new EventEmitter<any>();
  @Output() addProcessInfo = new EventEmitter<any>();
  totalProcessCost: any;

  constructor(
    public _toolingProcessConfig: CostingToolingProcessConfigService,
    public _toolConfig: ToolingConfigService,
    public sharedService: SharedService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['compVals'] && changes['compVals'].currentValue) {
      this.totalProcessCost = this.compVals.toolingProcessInfoList.reduce((totalCost, currentProcessInfo) => totalCost + Number(currentProcessInfo.totalProcessCost), 0);
      this.totalProcessCost = this.sharedService.isValidNumber(this.totalProcessCost);
    }
  }

  addProcess() {
    this.addProcessInfo.emit();
  }

  onEditProcessInfo(process) {
    this.editProcessInfo.emit(process);
  }

  onDeleteProcessClick(toolingProcessId) {
    this.deleteProcessInfo.emit(toolingProcessId);
  }
}
