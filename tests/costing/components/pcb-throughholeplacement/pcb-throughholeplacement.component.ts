import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EECoversionCostCalculatorService } from '../../services/eecoversion-cost-calculator.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pcb-throughholeplacement',
  templateUrl: './pcb-throughholeplacement.component.html',
  styleUrls: ['./pcb-throughholeplacement.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class PcbThroughholeplacementComponent implements OnChanges {
  @Input() throughHolePlacementForm: FormGroup;
  @Input() boardComponents: any[] = [];
  @Input() placementId: number;
  @Input() conversionCostId: number | undefined;

  constructor(
    private fb: FormBuilder,
    private eeCoversionCostCalculatorService: EECoversionCostCalculatorService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['placementId'] && changes['placementId'].currentValue != changes['placementId'].previousValue) {
      if (this.conversionCostId == undefined) {
        this.calculateCounts();
      }
    }

    if (changes['boardComponents'] && changes['boardComponents'].currentValue != changes['boardComponents'].previousValue) {
      if (this.conversionCostId == undefined) {
        this.calculateCounts();
      }
    }
  }

  calculateCounts() {
    const countCalculation = this.eeCoversionCostCalculatorService.calculateThCounts(this.boardComponents);
    const countValue: any = this.eeCoversionCostCalculatorService.runThCountCalculationAlgo(this.placementId, countCalculation);

    const countJointValue: any = this.eeCoversionCostCalculatorService.calculateJoints(this.boardComponents, countValue);

    this.throughHolePlacementForm.patchValue({
      waveSolderedPartTypes: countValue.waveThComponentsTypes,
      manualSolderedPartTypes: countValue.manualThComponentsTypes,
      selectiveSolderedPartTypes: countValue.selectiveThComponentsTypes,
      manualSolderPlacements: countValue.manualThComponentsPlacements,
      thPlacements: countValue.selectiveThComponentsPlacements + countValue.waveThComponentsPlacements,

      manualSolderJoints: countJointValue.manualJoints,
      selectiveSolderJoints: countJointValue.selectiveJoints,
      totalTHsolderJoints: countJointValue.manualJoints + countJointValue.selectiveJoints + countJointValue.waveJoints,
    });
  }
}
