import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Layer } from 'src/app/shared/config/material-pcb-config';
import { PCBCalculatorService } from '../../../services/material-pcb-calculator';
import { CommonModule } from '@angular/common';
import { StackupRow } from 'src/app/shared/config/pcba-rpa.config';
import { MatIcon } from '@angular/material/icon';
import { SharedService } from '../../../services/shared.service';
@Component({
  selector: 'app-stackup-diagram',
  templateUrl: './stackup-diagram.component.html',
  styleUrls: ['./stackup-diagram.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIcon],
})
export class StackupDiagramComponent implements OnInit {
  @Input() public partData: { [key: string]: any };
  public rows: StackupRow[] = [];
  layerTable: Layer[];
  showCoreAlert: boolean = false;
  showprePregAlert: boolean = false;
  nullLayerNames: string = '';
  constructor(
    private modelService: NgbModal,
    private _service: PCBCalculatorService,
    private _sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.calculateCost();
  }

  calculateCost() {
    this.layerTable = this._service.generateStackupLayers(
      this.partData?.formValues?.typeOfWeld?.value,
      this.partData?.formValues?.partTickness?.value,
      this.partData?.formValues?.typeOfConductor?.value,
      this.subFormArray,
      this.partData?.prepregList,
      this.partData?.laminatesList,
      this.partData?.formValues?.stockLength?.value
    );
    const totalWeight = this.partData?.coreList.reduce((sum, core) => sum + Number(core.value?.coreWeight || 0), 0);
    this.nullLayerNames = this.layerTable
      .filter((item) => item.value === null || item.value === undefined)
      .map((item) => item.name)
      .join(', ');
    this.showCoreAlert = totalWeight !== this.partData?.formValues?.stockLength?.value;
    const totalPPWeight = this.partData?.prepregSortedList?.reduce((sum, core) => sum + Number(core.value?.coreWeight || 0), 0);
    this.showprePregAlert = Number(this.partData?.formValues?.typeOfWeld?.value) > 2 && this._sharedService.isValidNumber(this.partData?.formValues?.typeOfWeld?.value / 2) !== totalPPWeight;
  }

  get subFormArray() {
    return this.partData?.formValues?.materialPkgs as FormArray;
  }

  dismissAll() {
    this.modelService.dismissAll();
  }
}
