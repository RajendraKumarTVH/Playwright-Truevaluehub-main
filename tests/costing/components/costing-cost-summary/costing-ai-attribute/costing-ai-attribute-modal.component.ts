import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AiSearchService } from 'src/app/shared/services';
import { MaterialInfoDto } from 'src/app/shared/models/material-info.model';
import { AiAttributeModel } from 'src/app/modules/ai-search/models/ai-attribute.model';
import { CotsInfoDto, PartInfoDto, ProcessInfoDto } from 'src/app/shared/models';
import { CostToolingDto } from 'src/app/shared/models/tooling.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SecondaryProcessDto } from 'src/app/shared/models/secondary-process.model';
import { SharedService } from '../../../services/shared.service';
import { SecondaryProcessNamesMap } from 'src/app/shared/enums/secondary-process-names.enum';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialTableComponent } from '../../costing-material-information/material-table/material-table.component';
import { ManufacturingTableComponent } from '../../costing-manufacturing-information/manufacturing-table/manufacturing-table.component';
import { ToolingTableComponent } from '../../costing-tooling-Info/tooling-info/tooling-table/tooling-table.component';
import { CostingPackagingInformationComponent } from '../../costing-packaging-information/costing-packaging-information.component';

@Component({
  selector: 'app-costing-ai-attribute-modal',
  templateUrl: './costing-ai-attribute-modal.component.html',
  styleUrls: ['./costing-ai-attribute-modal.component.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialTableComponent, ManufacturingTableComponent, ToolingTableComponent, CostingPackagingInformationComponent],
})
export class CostingAiAttributeComponent implements OnInit {
  @Input() partId: number;
  partInfoDto?: PartInfoDto;
  materialInfoDataSource: MaterialInfoDto[] = [];
  processInfoDataSource: ProcessInfoDto[] = [];
  toolingInfoDataSource: {
    toolInfoList: CostToolingDto[];
  } = { toolInfoList: [] };
  secondaryProcessDataSource: SecondaryProcessDto[] = [];
  costInfoDataSource: CotsInfoDto[] = [];
  showLoader = false;
  public secondaryProcessNamesMap = SecondaryProcessNamesMap;
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();

  constructor(
    private readonly aiService: AiSearchService,
    private activeModal: NgbActiveModal,
    readonly sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.setDataSource();
  }

  dismissAll() {
    this.activeModal.close();
  }

  toggleReadMore(rowId) {
    const content = document.getElementById(rowId + '-content');
    const moreLink = document.getElementById(rowId + '-more');
    const lessLink = document.getElementById(rowId + '-less');

    if (moreLink.style.display === 'none') {
      content.style.maxHeight = '50px'; // You can adjust the height as needed
      moreLink.style.display = 'inline';
      lessLink.style.display = 'none';
    } else {
      content.style.maxHeight = '100px';
      moreLink.style.display = 'none';
      lessLink.style.display = 'inline';
    }
  }

  private setDataSource() {
    this.showLoader = true;
    this.aiService
      .getAttributeInfo(this.partId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (response) => {
          this.partInfoDto = response;
          const attributeInfo: AiAttributeModel = {
            materialInfos: response?.materialInfos,
            costTooling: response?.costTooling,
            cotsInfos: response?.cotsInfos,
            processInfos: response?.processInfos,
            secondaryProcesses: response?.secondaryProcesses,
          };
          this.setMaterialInfoDataSource(attributeInfo);
          this.setProcessInfoDataSource(attributeInfo);
          this.setCostTooligInfoDataSource(attributeInfo);
          this.setSecondaryProcessInfoDataSource(attributeInfo);
          this.setCostInfoDataSource(attributeInfo);
          this.showLoader = false;
        },
      });
  }

  private setMaterialInfoDataSource(response: AiAttributeModel) {
    this.materialInfoDataSource = response?.materialInfos ?? [];
  }

  private setProcessInfoDataSource(response: AiAttributeModel) {
    this.processInfoDataSource = response?.processInfos ?? [];
  }

  private setCostTooligInfoDataSource(response: AiAttributeModel) {
    this.toolingInfoDataSource.toolInfoList = response?.costTooling ?? [];
  }
  private setSecondaryProcessInfoDataSource(response: AiAttributeModel) {
    this.secondaryProcessDataSource = response?.secondaryProcesses ?? [];
  }
  private setCostInfoDataSource(response: AiAttributeModel) {
    this.costInfoDataSource = response?.cotsInfos ?? [];
  }
}
