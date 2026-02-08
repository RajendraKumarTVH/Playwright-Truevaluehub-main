import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BillOfMaterialService implements OnDestroy {
  private ngUnsubsribeAll$ = new Subject<void>();
  public additionalAttributesToRemove = ['Main Category', 'Sub Category', 'Datasheet', 'Image', 'Price', 'qty', 'Min Qty', 'Length', 'DK Part', 'Mfr', 'Series', 'Product_Status', 'Package_Cooled'];
  constructor() {}

  ngOnDestroy() {
    this.ngUnsubsribeAll$.next(undefined);
    this.ngUnsubsribeAll$.complete();
  }

  getBOMStatus = () => [
    { id: BOMStatus.Direct, name: 'Direct' },
    { id: BOMStatus.Partial, name: 'Partial' },
    { id: BOMStatus.NoMatch, name: 'No Match' },
  ];
  getStandardCustom = () => [
    { id: StandardCustom.Standard, name: 'Standard' },
    { id: StandardCustom.Custom, name: 'Custom' },
  ];
  getUnitOfMeasures = () => [
    { value: 'Meter', label: 'Meter' },
    { value: 'Foot', label: 'Foot' },
    { value: 'mL', label: 'mL' },
    { value: 'Fluid oz', label: 'Fluid oz' },
    { value: 'Lb', label: 'Lb' },
    { value: 'Kg', label: 'Kg' },
    { value: 'Nos', label: 'Nos' },
  ];

  getPartStatusList = () => [
    { id: PartStatus.Active, name: 'Active' },
    { id: PartStatus.Inactive, name: 'Inactive' },
    { id: PartStatus.Obsolete, name: 'Obsolete' },
    { id: PartStatus.EndOfLife, name: 'End of Life' },
    { id: PartStatus.NotForNewDesigns, name: 'Not For New Designs' },
    { id: PartStatus.LastTimeBuy, name: 'Last Time Buy' },
    { id: PartStatus.Discontinued, name: 'Discontinued' },
    { id: PartStatus.Unknown, name: '-' },
  ];
}

export enum BOMStatus {
  Direct = 1,
  Partial = 2,
  NoMatch = 3,
}

export enum StandardCustom {
  Standard = 1,
  Custom = 2,
}

export enum PartStatus {
  Active = 1,
  Inactive = 2,
  Obsolete = 3,
  EndOfLife = 4,
  NotForNewDesigns = 5,
  LastTimeBuy = 6,
  Discontinued = 7,
  Unknown = 8,
}
