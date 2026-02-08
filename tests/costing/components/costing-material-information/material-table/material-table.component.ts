import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges, inject, OnDestroy } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Store } from '@ngxs/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { UserCanUpdateCostingState } from 'src/app/modules/_state/userCanUpdate-costing.state';

@Component({
  selector: 'app-material-table',
  templateUrl: './material-table.component.html',
  styleUrls: ['./material-table.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatTableModule, MatIconModule],
})
export class MaterialTableComponent implements OnChanges, OnDestroy {
  @Input() materialInfoList: any;
  @Input() processFlag: any;
  @Input() showAddNewOption: any;
  @Input() selectedMaterialInfoId: any;
  private unsubscribeAll$: Subject<undefined> = new Subject<undefined>();
  _store = inject(Store);
  canUpdate: boolean;
  @Output() addMaterialInfo = new EventEmitter<any>();
  @Output() editMaterialInfo = new EventEmitter<any>();
  @Output() deleteMaterialInfo = new EventEmitter<any>();
  displayedColumns: string[] = ['edit', 'sl', 'materialDescription', 'co2', 'cost', 'action'];
  _canUserUpdateCosting$: Observable<boolean> = this._store.select(UserCanUpdateCostingState.getCanUserUpdateCosting);
  dataSource = new MatTableDataSource([]);
  totalCo2Cost = 0;
  totalCost = 0;

  constructor(public sharedService: SharedService) {
    this._canUserUpdateCosting$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((result: boolean) => {
      this.canUpdate = result;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.materialInfoList && changes.materialInfoList.previousValue !== changes.materialInfoList.currentValue) {
      this.dataSource.data = this.materialInfoList;
      this.totalCo2Cost = this.materialInfoList.reduce((acc, row) => acc + (row.esgImpactCO2KgPart || 0), 0);
      this.totalCost = this.materialInfoList.reduce((acc, row) => acc + (row.netMatCost || 0), 0);
    }
  }

  onAddMaterial() {
    this.addMaterialInfo.emit();
  }

  onEditMaterial(material) {
    this.editMaterialInfo.emit(material);
  }

  onDeleteMaterial(material) {
    this.deleteMaterialInfo.emit(material);
  }
  ngOnDestroy() {
    if (this.unsubscribeAll$) {
      this.unsubscribeAll$.unsubscribe();
    }
  }
}
