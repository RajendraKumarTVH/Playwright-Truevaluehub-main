import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges, OnChanges } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ToolingConfigService } from 'src/app/shared/config/cost-tooling-config';
import { CostingToolingMaterialConfigService } from 'src/app/shared/config/costing-tooling-material-config.service';

@Component({
  selector: 'app-tooling-material-table',
  templateUrl: './tooling-material-table.component.html',
  styleUrls: ['./tooling-material-table.component.scss'],
  standalone: true,
  imports: [MatIconModule, CommonModule, FormsModule, ReactiveFormsModule],
})
export class ToolingMaterialTableComponent implements OnChanges {
  @Input() compVals: any;
  @Input() canUpdate: boolean = false;
  @Output() editMaterialInfo = new EventEmitter<any>();
  @Output() deleteMaterialInfo = new EventEmitter<any>();
  @Output() addMaterialInfo = new EventEmitter<any>();
  copperIndex: number = 0;
  mouldIndex: number = 0;
  otherIndex: number = 0;

  constructor(
    public _toolConfig: ToolingConfigService,
    public _toolingMaterialConfig: CostingToolingMaterialConfigService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['compVals'] && changes['compVals'].currentValue) {
      this.copperIndex = this.compVals.coreMaterialInfoList.length + this.compVals.mouldMaterialInfoList.length + 1;
      this.mouldIndex = this._toolConfig.commodity.isSheetMetal
        ? this.compVals.coreMaterialInfoList.length + this.compVals.diePunchMaterialInfoList.length + 1
        : this.compVals.coreMaterialInfoList.length + 1;
      this.otherIndex = this.compVals.electrodeMaterialInfoList.length + this.compVals.coreMaterialInfoList.length + this.compVals.mouldMaterialInfoList.length + 1;
    }
  }

  addMaterial() {
    this.addMaterialInfo.emit();
  }

  onEditMaterialInfo(material) {
    this.editMaterialInfo.emit(material);
  }

  onDeleteMaterialClick(toolingMaterialId) {
    this.deleteMaterialInfo.emit(toolingMaterialId);
  }
}
