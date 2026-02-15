import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DigitalFactoryRouteLinks } from '../../Shared/digital-factory-route-links';
import { DigitalFactoryService } from '../../../Service/digital-factory.service';
import { DigitalFactoryDtoNew } from '../../../Models/digital-factory-dto';
import { DfSupplierDirectoryMasterDto } from '../../../Models/df-supplier-directory-master-dto';
import { DigitalFactoryCommonService } from '../../Shared/digital-factory-common-service';
import { SupplierCostStructureComponent } from './supplier-cost-structure/supplier-cost-structure.component';
import { SupplierFactoryAssumptionComponent } from './supplier-factory-assumption/supplier-factory-assumption.component';
import { SupplierTermsComponent } from './digital-factory-info/supplier-terms/supplier-terms.component';
import { CommonModule } from '@angular/common';
import { SupplierProfileExpandPanelComponent } from './supplier-profile-expand-panel/supplier-profile-expand-panel.component';
import { SupplierPowerAssumptionComponent } from './supplier-power-assumption/supplier-power-assumption.component';
import { SupplierLabourAssumptionComponent } from './supplier-labour-assumption/supplier-labour-assumption.component';
import { MachineCostInfoComponent } from './digital-factory-info/machine-cost-info/machine-cost-info.component';
import { MaterialCostInfoComponent } from './digital-factory-info/material-cost-info/material-cost-info.component';
import { DropdownModule } from 'primeng/dropdown';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs';
import { DfSupplierDirectoryTableListDto } from '../../../Models/df-supplier-directory-table-list-dto';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { SupplierSustainabilityComponent } from './supplier-sustainability/supplier-sustainability.component';

@Component({
  selector: 'app-supplier-info',
  templateUrl: './supplier-info.component.html',
  styleUrls: ['./supplier-info.component.scss'],
  standalone: true,
  imports: [
    SupplierCostStructureComponent,
    SupplierFactoryAssumptionComponent,
    SupplierTermsComponent,
    CommonModule,
    SupplierProfileExpandPanelComponent,
    SupplierTermsComponent,
    SupplierPowerAssumptionComponent,
    SupplierLabourAssumptionComponent,
    MachineCostInfoComponent,
    MaterialCostInfoComponent,
    DropdownModule,
    FormsModule,
    MatIconModule,
    MatTabsModule,
    SupplierSustainabilityComponent,
  ],
})
export class SupplierInfoComponent implements OnInit, OnDestroy {
  navLinks: any[] = [];
  isMenuOpen = true;
  contentMargin = 160;
  supplierId?: number;
  isSupplierAlreadyAdded?: boolean;
  selectedSupplierInfo?: DfSupplierDirectoryMasterDto;
  selectedDigitalFactoryInfo?: DigitalFactoryDtoNew;
  supplierName?: string;
  isLoaded = true;
  pagedOptions: DfSupplierDirectoryMasterDto[] = [];
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();

  constructor(
    private readonly router: Router,
    private route: ActivatedRoute,
    private readonly digitalFactoryService: DigitalFactoryService,
    private readonly digitalFactoryCommonService: DigitalFactoryCommonService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.supplierId = +params.get('id');
      if (this.supplierId) this.setSupplierDetails();
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
    this.selectedDigitalFactoryInfo = undefined;
  }

  backToSuppliers(): void {
    this.router.navigate([DigitalFactoryRouteLinks.home]);
  }

  saveToDigitalFactory(): void {
    const clientDigitalFactory: DigitalFactoryDtoNew = {
      supplierId: this.supplierId,
      vendorName: this.selectedSupplierInfo?.vendorName,
    };
    this.digitalFactoryService.addToDigitalFactory(clientDigitalFactory).subscribe({
      next: (response: DigitalFactoryDtoNew) => {
        this.isSupplierAlreadyAdded = true;
        this.selectedDigitalFactoryInfo = response;
        this.digitalFactoryCommonService.digitalFacotryDetails = response;
        this.navLinks = this.getDfNavigations();
      },
    });
  }

  removeFromDigitalFactory() {
    if (this.selectedDigitalFactoryInfo) {
      this.digitalFactoryService.removeFromDigitalFactory(this.selectedDigitalFactoryInfo.digitalFactoryId).subscribe({
        next: () => {
          this.isSupplierAlreadyAdded = false;
        },
      });
    }
  }

  loadDropdownData(event: any) {
    const { first } = event;
    this.digitalFactoryService
      .getSuppliers(first)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (result: DfSupplierDirectoryTableListDto) => {
          this.pagedOptions = result?.dfSupplierDirectoryMasterDtos;
        },
      });
  }

  onSupplierChange(event) {
    this.selectedDigitalFactoryInfo = undefined;
    this.supplierId = event.value.supplierId;
    if (this.selectedSupplierInfo) {
      this.router.navigate([DigitalFactoryRouteLinks.supplierInfo, this.supplierId]);
    }
  }

  private setSupplierDetails() {
    this.isLoaded = false;
    this.digitalFactoryService.getDigitalFactoryBySupplierId(this.supplierId).subscribe({
      next: (result: DigitalFactoryDtoNew) => {
        if (result && result.digitalFactoryId > 0) {
          this.selectedDigitalFactoryInfo = result;
          this.isSupplierAlreadyAdded = true;
          this.digitalFactoryCommonService.digitalFacotryDetails = result;
          this.navLinks = this.getDfNavigations();
        } else {
          this.isSupplierAlreadyAdded = false;
        }
        this.isLoaded = true;
      },
    });
    this.digitalFactoryService.getMasterSupplierInfoByIds([this.supplierId]).subscribe({
      next: (result: DfSupplierDirectoryMasterDto[]) => {
        if (result) {
          this.selectedSupplierInfo = result[0];
          this.supplierName = this.selectedSupplierInfo.vendorName;
          this.digitalFactoryCommonService.dfSupplierMasterDetails = this.selectedSupplierInfo;
          this.digitalFactoryCommonService.suppplierDataLoaded.next();
        }
      },
    });
  }

  private getDfNavigations() {
    return [
      {
        link: 'profile',
        label: 'Profile',
        index: 0,
      },
      {
        link: 'cost-structure',
        label: 'Cost Structure',
        index: 1,
      },
      {
        link: 'factory-assumptions',
        label: 'Factory Assumptions',
        index: 2,
      },
      {
        link: 'labour-assumptions',
        label: 'Labour Assumptions',
        index: 3,
      },
      {
        link: 'power-assumptions',
        label: 'Power Assumptions',
        index: 4,
      },
      {
        link: 'material-cost',
        label: 'Material Cost',
        index: 5,
      },
      {
        link: 'machine-cost',
        label: 'Machine Cost',
        index: 6,
      },
    ];
  }
}
