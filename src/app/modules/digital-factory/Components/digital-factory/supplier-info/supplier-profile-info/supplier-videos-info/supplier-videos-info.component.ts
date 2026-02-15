import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { DfSupplierDirectoryMasterDto } from 'src/app/modules/digital-factory/Models/df-supplier-directory-master-dto';

@Component({
  selector: 'app-supplier-videos-info',
  templateUrl: './supplier-videos-info.component.html',
  styleUrls: ['./supplier-videos-info.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SupplierVideosInfoComponent {
  @Input() supplierInfo?: DfSupplierDirectoryMasterDto;
  isLoaded = false;
}
