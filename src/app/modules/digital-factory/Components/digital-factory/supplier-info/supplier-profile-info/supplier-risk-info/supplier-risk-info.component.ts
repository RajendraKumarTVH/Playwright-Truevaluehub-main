import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DfSupplierDirectoryMasterDto } from 'src/app/modules/digital-factory/Models/df-supplier-directory-master-dto';

@Component({
  selector: 'app-supplier-risk-info',
  templateUrl: './supplier-risk-info.component.html',
  styleUrls: ['./supplier-risk-info.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class SupplierRiskInfoComponent {
  @Input() supplierInfo?: DfSupplierDirectoryMasterDto;
  isLoaded = false;
}
