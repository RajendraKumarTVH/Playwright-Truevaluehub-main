import { Component, Input, effect, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { MatIconModule } from '@angular/material/icon';
import { InfoTooltipComponent } from 'src/app/shared/components/info-tooltip/info-tooltip.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AutoTooltipDirective } from 'src/app/shared/directives/auto-tooltip.directive';
import { Observable } from 'rxjs';
import { MaterialInfoDto, PartInfoDto, ProcessMasterDto } from 'src/app/shared/models';
import { Store } from '@ngxs/store';
import { ProcessMasterState } from 'src/app/modules/_state/process-master.state';
import { MaterialInfoSignalsService } from 'src/app/shared/signals/material-info-signals.service';
import { MachineDetails } from 'src/app/modules/costing/costing.config';

@Component({
  selector: 'app-machine-details',
  templateUrl: './machine-details.component.html',
  styleUrl: './machine-details.component.scss',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ChartModule, MatIconModule, InfoTooltipComponent, MatAutocompleteModule, AutoTooltipDirective],
})
export class MachineDetailsComponent implements OnChanges {
  // Chart-related properties - commented out as chart is not currently being used
  machineChartData: any;
  machineChartOptions: any;
  public processMasterDataList: any[] = [];
  public processList: any[] = [];
  currentPart: PartInfoDto;
  commodityId: number;
  selectedMatProcessTypeId: string = '';
  private _store = inject(Store);
  private materialInfoSignalService = inject(MaterialInfoSignalsService);
  _processMasterData$: Observable<ProcessMasterDto[]> = this._store.select(ProcessMasterState.getAllProcessMasterData);

  materialProcessIdEffect = effect(() => {
    this.selectedMatProcessTypeId = this.materialInfoSignalService.matProcessTypeName();
  });

  materialInfoEffect = effect(() => {
    this.processList = this.materialInfoSignalService.materialProcessList();
  });
  public materialInfoList: MaterialInfoDto[];
  @Input() processTypesList: any[] = [];
  @Input() machineDetails: MachineDetails;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['machineDetails']?.currentValue) {
      this.initMachineChart();
    }
  }

  constructor() {}

  initMachineChart(): void {
    this.machineChartData = {
      labels: ['Depreciation', 'Interest', 'Rent & Overhead', 'Power', 'Maintenance', 'Supplies'],
      datasets: [
        {
          data: [
            this.machineDetails?.depreciationCost,
            this.machineDetails?.inputedInterestCost,
            this.machineDetails?.rentCost,
            this.machineDetails?.powerCost,
            this.machineDetails?.maintenanceCost,
            this.machineDetails?.suppliesCost,
          ],
          backgroundColor: ['#B49AE1', '#C9AFE9', '#E0D2FF', '#7DD3FC', '#A5E4FF', '#CFF3FF'],
          borderWidth: 0,
        },
      ],
    };

    this.machineChartOptions = {
      cutout: '60%',
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
      },
    };
  }
}
