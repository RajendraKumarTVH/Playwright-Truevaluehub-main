import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedService } from 'src/app/modules/costing/services/shared.service';

@Component({
  selector: 'app-panel-utilization',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule], // ✅ only this
  templateUrl: './panel-utilization.component.html',
  styleUrl: './panel-utilization.component.scss',
})
export class PanelUtilizationComponent implements OnInit {
  @Input() public partData: { [key: string]: any };
  calculatedUtilizationList: any[] = [];
  constructor(
    private modelService: NgbModal,
    private shared: SharedService
  ) {}

  ngOnInit(): void {
    this.calculatedUtilizationList = this.partData?.utilizationlist;
  }

  dismissAll() {
    this.modelService.dismissAll();
  }
}
