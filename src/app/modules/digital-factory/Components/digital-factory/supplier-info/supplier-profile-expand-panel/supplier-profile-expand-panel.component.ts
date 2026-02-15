import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DfSupplierDirectoryMasterDto } from 'src/app/modules/digital-factory/Models/df-supplier-directory-master-dto';
import { SupplierVideosInfoComponent } from '../supplier-profile-info/supplier-videos-info/supplier-videos-info.component';
import { SupplierCertificationInfoComponent } from '../supplier-profile-info/supplier-certification-info/supplier-certification-info.component';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { SupplierRiskInfoComponent } from '../supplier-profile-info/supplier-risk-info/supplier-risk-info.component';
import { SupplierProductInfoComponent } from '../supplier-profile-info/supplier-product-info/supplier-product-info.component';
import { SupplierProfileInfoComponent } from '../supplier-profile-info/supplier-profile-info.component';

@Component({
  selector: 'app-supplier-profile-expand-panel',
  templateUrl: './supplier-profile-expand-panel.component.html',
  styleUrls: ['./supplier-profile-expand-panel.component.scss'],
  standalone: true,
  imports: [
    MatIconModule,
    CommonModule,
    FormsModule,
    SupplierVideosInfoComponent,
    SupplierCertificationInfoComponent,
    MatAccordion,
    MatExpansionModule,
    SupplierRiskInfoComponent,
    SupplierProductInfoComponent,
    SupplierProfileInfoComponent,
  ],
})
export class SupplierProfileExpandPanelComponent {
  @Input() supplierInfo?: DfSupplierDirectoryMasterDto;
}
