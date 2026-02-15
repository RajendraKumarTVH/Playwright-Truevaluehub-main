import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { DfSupplierDirectoryMasterDto } from 'src/app/modules/digital-factory/Models/df-supplier-directory-master-dto';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GoogleMap, GoogleMapsModule, MapMarker } from '@angular/google-maps';
import { DigitalFactoryService } from 'src/app/modules/digital-factory/Service/digital-factory.service';

@Component({
  selector: 'app-supplier-profile-info',
  templateUrl: './supplier-profile-info.component.html',
  styleUrls: ['./supplier-profile-info.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, GoogleMapsModule, GoogleMap, MapMarker],
})
export class SupplierProfileInfoComponent implements OnChanges, OnDestroy {
  @Input() supplierInfo?: DfSupplierDirectoryMasterDto;
  zoom = 5;
  isLoaded = false;
  marker: { lat: number; lng: number; icon: string };
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();

  constructor(private digitalFactoryService: DigitalFactoryService) {}

  ngOnChanges(): void {
    this.setData();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }

  private setData() {
    if (!this.supplierInfo) return;
    this.loadMarker();
    this.isLoaded = true;
  }

  private loadMarker(): void {
    this.digitalFactoryService
      .getSupplierMarkerByName(this.supplierInfo.vendorName)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response) => {
        if (response) {
          this.marker = {
            lat: response.lat,
            lng: response.lng,
            icon: 'assets/icons/map-marker-single.svg',
          };
        }
      });
  }
}
