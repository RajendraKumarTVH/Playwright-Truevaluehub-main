import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
// Need to fix

import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { IndustrisComponent } from 'src/app/shared/components';
import { AnnualRevenueTypeNameMap, CurrencyTypeNameMap, UnitTypesEnumNameMap } from 'src/app/shared/enums';
import { SecurityPermissionType } from 'src/app/shared/enums/security-permission-type.enum';
import { CountryDataMasterDto, Industry } from 'src/app/shared/models';
import { CustomerDto } from 'src/app/shared/models/customer.model';
import { BlockUiService, CountryDataService } from 'src/app/shared/services';
import { PermissionService } from 'src/app/shared/services/permission.service';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatAccordion, IndustrisComponent, MatAutocompleteModule, MatOptionModule, MatExpansionModule],
})
export class CustomerComponent implements OnInit, AfterViewInit {
  customerForm: FormGroup;
  countryList: CountryDataMasterDto[] = [];

  filteredCountryList$: Observable<CountryDataMasterDto[]>;

  customerList: CustomerDto[] = [];
  filteredVendorList$: Observable<CustomerDto[]>;

  @ViewChild(MatAccordion) accordion: MatAccordion;
  @ViewChild(IndustrisComponent) industris: IndustrisComponent;

  selectedIndustrisType: Industry[] = [];
  currencyList: { key: number; name: string }[] = [];
  anualRevenueList: { key: number; name: string }[] = [];
  preferedUnitTypes: { key: number; name: string }[] = [];
  canResetCustomer: boolean = false;

  options: any = {
    types: [],
    componentRestrictions: { country: '' },
    bounds: undefined,
    fields: [],
    strictBounds: false,
    origin: undefined,
  };

  //#region get controls

  get f() {
    return this.customerForm.controls;
  }
  //#endregion

  constructor(
    private _fb: FormBuilder,
    private countryService: CountryDataService,
    private permissionService: PermissionService,
    private blockUiService: BlockUiService
  ) {
    this.loadConfigData();
    this.subscribeData();
  }

  ngOnInit(): void {
    this.creteFormGroup();
    const canResetCustomerPermissions = [SecurityPermissionType.CustomerModule, SecurityPermissionType.All];
    this.canResetCustomer = this.permissionService.hasPermission(canResetCustomerPermissions);
  }

  ngAfterViewInit() {
    this.accordion.openAll();
  }

  //Need to fix
  handleAddressChange(address: any) {
    console.log(address);
  }

  // handleAddressChange(address: Address) {
  //   // console.log(address);
  //   const adrsComponet = address.address_components;
  //   const _country = adrsComponet.find(
  //     (x) => x.types[0] == 'country'
  //   )?.long_name;
  //   const _state = adrsComponet.find(
  //     (x) => x.types[0] == 'administrative_area_level_1'
  //   )?.long_name;
  //   const _city = adrsComponet.find(
  //     (x) =>
  //       x.types[0] == 'administrative_area_level_3' ||
  //       x.types[0] == 'administrative_area_level_2'
  //   )?.long_name;
  //   const _zipCode = adrsComponet.find(
  //     (x) => x.types[0] == 'postal_code'
  //   )?.long_name;

  //   const geometry = address.geometry;
  //   const lat = geometry.location.lat();
  //   const lng = geometry.location.lng();

  //   this.getControl('lat').setValue(lat);
  //   this.getControl('lng').setValue(lng);

  //   this.getControl('country').setValue(_country);
  //   this.getControl('state').setValue(_state);
  //   this.getControl('city').setValue(_city);
  //   this.getControl('zipCode').setValue(_zipCode);

  //   this.customerForm.updateValueAndValidity();
  // }

  reset() {
    this.customerForm.reset();
  }

  save() {
    // const formVal = this.customerForm.getRawValue();
    // const payload = {
    //   ...formVal,
    //   mfrCountryId: this.countryList?.find(cnt => cnt.countryName == formVal.mfrCountry)?.countryId
    // } as CustomerDto;
    // this.blockUiService.pushBlockUI('loadConfigData');
    // this.vendorSvc.createVendor(payload)
    //   .pipe(takeUntil(this.unsubscribe$))
    //   .subscribe(data => {
    //     this.blockUiService.popBlockUI('loadConfigData')
    //     if (data) {
    //       this.customerList = [...this.customerList, data];
    //       this.vendorSvc.vendorDtoSubject$.next(this.customerList);
    //       this.customerForm.reset();
    //     }
    //   }, (error: any) => {
    //     console.log(error);
    //     this.blockUiService.popBlockUI('loadConfigData')
    //   });
  }

  // nameOnChange($event: any) {
  // const val = $event?.target.value;
  // if (val) {
  //   const _dto = this.customerList.find(x => x.vendorName?.toLowerCase() == val.toLowerCase());
  //   if (!!_dto) {
  //     const formVal = {
  //       vendorId: _dto.vendorId,
  //       vendorName: val,
  //       mfrCountry: this.countryList?.find(cnt => cnt.countryId == _dto?.mfrCountryId)?.countryName || '',
  //       mfrAddress: _dto.mfrAddress,
  //       mfrCity: _dto.mfrCity,
  //       mfrZipCode: _dto.mfrZipCode,
  //       mfrState: _dto.mfrState,
  //       lat: _dto.lat,
  //       lng: _dto.lng,
  //       dunsId: _dto.dunsId,
  //       taxId: _dto.taxId,
  //       annualRevenueType: _dto.annualRevenueType,
  //       adminEmail: _dto.adminEmail,
  //       adminName: _dto.adminName,
  //       adminPhoneNumber: _dto.adminPhoneNumber,
  //       unitType: _dto.unitType,
  //       currencyType: _dto.currencyType,
  //       isActive: _dto.isActive,
  //       avgCostOfCapital: _dto.avgCostOfCapital
  //     }
  //     this.customerForm.setValue(formVal);
  //     this.customerForm.updateValueAndValidity();
  //   }
  // }
  // }

  //#region private methods

  private subscribeData() {
    this.countryService.countryList$.subscribe({
      next: (data) => {
        if (data && data?.length) {
          this.countryList = data;

          this.filteredCountryList$ = this.getControl('country').valueChanges.pipe(
            startWith(''),
            map((value) => this._filterCountry(value || ''))
          );
        }
      },
      error: (error: any) => {
        console.log(error);
      },
    });
  }

  private _filterCountry(value: any): CountryDataMasterDto[] {
    let filterValue = '';
    if (value instanceof Object) {
      filterValue = (value.countryName || '').toLowerCase();
    } else {
      filterValue = (value || '').toLowerCase();
    }
    return this.countryList.filter((country) => (country.countryName || '').toLowerCase().includes(filterValue));
  }

  private creteFormGroup(_dto?: CustomerDto) {
    const country = this.countryList?.find((cnt) => cnt.countryId == _dto?.location.country)?.countryName || '';
    this.customerForm = this._fb.group({
      vendorId: [_dto?.id || 0],
      name: [_dto?.name, [Validators.required]],
      mfrCountry: [country, [Validators.required]],
      mfrAddress: [_dto?.location.address, [Validators.required]],
      mfrCity: [_dto?.location.city, [Validators.required]],
      mfrZipCode: [_dto?.location.zipCode, [Validators.required]],
      mfrState: [_dto?.location.state, [Validators.required]],
      lat: [_dto?.location.lat],
      lng: [_dto?.location.lng],
      dunsId: [_dto?.info.dunsId, [Validators.maxLength(9)]],
      taxId: [_dto?.info.taxId, [Validators.maxLength(10)]],
      annualRevenueType: [_dto?.info.annualRevenueType || 0, [Validators.required]],
      adminEmail: [_dto?.admin.adminEmail, [Validators.email, Validators.required, Validators.maxLength(128)]],
      adminName: [_dto?.admin.adminName, [Validators.maxLength(128)]],
      adminPhoneNumber: [_dto?.admin.adminPhoneNumber, [Validators.maxLength(16)]],
      unitType: [_dto?.info.unitType || 0],
      currencyType: [_dto?.info.currencyType || 0],
      isActive: [_dto?.isActive || true, [Validators.required]],
      avgCostOfCapital: [_dto?.info.avgCostOfCapital],
    });
  }

  private loadConfigData() {
    this.anualRevenueList = this.getConfigList(this.anualRevenueList, AnnualRevenueTypeNameMap);
    this.currencyList = this.getConfigList(this.currencyList, CurrencyTypeNameMap);
    this.preferedUnitTypes = this.getConfigList(this.preferedUnitTypes, UnitTypesEnumNameMap);
  }

  private getConfigList(list: { key: number; name: string }[], nameMap: Map<number, string>) {
    for (const item of nameMap) {
      const key = item[0];
      const name = item[1];
      list.push({ key, name });
    }
    return list;
  }

  private getControl(name: string) {
    return this.customerForm?.get(name) as AbstractControl;
  }
}
