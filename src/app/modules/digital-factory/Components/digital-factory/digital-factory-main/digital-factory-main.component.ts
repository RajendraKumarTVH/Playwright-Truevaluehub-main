import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { DFSupplierCountDetails } from '../../../Models/df-supplier-count-details';
import { SearchBarModelDto } from 'src/app/shared/models/search-bar-model';
import { SearchKeyDropDownValue, SearchKeyModel } from 'src/app/shared/models/search-key-model';
import { SupplierDirectoryTableComponent } from '../supplier-directory-table/supplier-directory-table.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DigitalFactoryTableComponent } from '../digital-factory-table/digital-factory-table.component';
import { SearchBarComponent } from 'src/app/shared/components/search-bar/search-bar.component';
import { DigitalFactoryMapComponent } from '../digital-factory-map/digital-factory-map.component';
import { TabViewModule } from 'primeng/tabview';
import { DigitalFactoryCommonService } from '../../Shared/digital-factory-common-service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-digital-factory-main',
  templateUrl: './digital-factory-main.component.html',
  styleUrls: ['./digital-factory-main.component.scss'],
  standalone: true,
  imports: [
    SupplierDirectoryTableComponent,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatIconModule,
    DigitalFactoryTableComponent,
    SearchBarComponent,
    DigitalFactoryMapComponent,
    TabViewModule,
    MatSlideToggleModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DigitalFactoryMainComponent implements OnInit {
  mapViewEnabled = false;
  mapViewEnabledForDf = false;
  selectedOptions = [];
  suppliersCountDetails?: DFSupplierCountDetails[] = [];
  searchedSupplier?: string;
  searchedCountry?: string;
  searchedRegion?: string;
  selectedCountry?: string;
  selectedRegion?: string;
  isCountrySelected = false;
  regionList = [];
  searchKeys: SearchKeyModel[];
  searchModel?: SearchBarModelDto[];
  selectedTabIndex = 0;
  currentTabSupplierCountDetails?: DFSupplierCountDetails;
  searchModelForDF?: SearchBarModelDto[];

  constructor(public digitalfactoryCommonHelper: DigitalFactoryCommonService) {}

  ngOnInit(): void {
    if (this.digitalfactoryCommonHelper.appliedSearchModel) {
      this.searchModel = this.digitalfactoryCommonHelper.appliedSearchModel;
    }
  }

  onMapViewChange(event: any): void {
    this.mapViewEnabled = event.checked;
    this.mapViewEnabledForDf = event.checked;
  }

  onSearch(value: any) {
    this.searchedSupplier = value;
  }

  onKeydown(event: any, value: any) {
    this.searchedSupplier = value;
  }

  onCountryOptionChange(event: any) {
    this.selectedCountry = this.currentTabSupplierCountDetails.countryList.find((x) => x.countryId == event.option.value)?.countryName;
    this.searchedCountry = event.option.value;
    this.isCountrySelected = true;
    this.selectedRegion = '';
    this.regionList = this.currentTabSupplierCountDetails.regionList.filter((x) => x.countryId === event.option.value);
  }

  onRegionOptionChange(event: any) {
    this.selectedRegion = this.currentTabSupplierCountDetails.regionList.find((x) => x.regionId == event.option.value)?.region;
    this.searchedRegion = event.option.value;
  }

  onSuppliersDataReceived(data: DFSupplierCountDetails): void {
    const existingCountDetails = this.suppliersCountDetails.find((x) => x.tabIndex === this.selectedTabIndex);
    if (existingCountDetails) {
      existingCountDetails.totalSuppliers = data.totalSuppliers;
      existingCountDetails.activeSuppliers = data.activeSuppliers;
      existingCountDetails.categories = data.categories;
      existingCountDetails.countryList = data.countryList;
      existingCountDetails.regionList = data.regionList;
      existingCountDetails.tabIndex = data.tabIndex;
    } else {
      this.suppliersCountDetails.push({
        totalSuppliers: data.totalSuppliers,
        activeSuppliers: data.activeSuppliers,
        categories: data.categories,
        countryList: data.countryList,
        regionList: data.regionList,
        tabIndex: data.tabIndex,
      });
    }
    this.currentTabSupplierCountDetails = this.suppliersCountDetails.find((x) => x.tabIndex === this.selectedTabIndex);
    this.setCountDetails();
    this.mapViewEnabled = true;
    if (this.selectedTabIndex == 1) {
      this.mapViewEnabledForDf = true;
    }
  }

  onSearchApply(searchModel: SearchBarModelDto[]) {
    const appliedSearch = [...searchModel];
    this.digitalfactoryCommonHelper.appliedSearchModel = appliedSearch;
    if (this.selectedTabIndex === 0) {
      this.searchModel = appliedSearch;
      return;
    }
    this.searchModelForDF = appliedSearch;
  }

  onTabChange(event: any) {
    this.selectedTabIndex = event.index;
    this.currentTabSupplierCountDetails = this.suppliersCountDetails.find((x) => x.tabIndex === this.selectedTabIndex);
  }

  private setCountDetails() {
    const countryNameList = this.currentTabSupplierCountDetails?.countryList?.map((x) => x.countryName);
    this.searchKeys = [
      {
        key: 'Supplier',
      },
      {
        key: 'Category',
      },
      {
        key: 'Country',
        isDropDown: true,
        dropDownValues: countryNameList?.map((x) => ({ id: x, name: x }) as SearchKeyDropDownValue),
      },
      {
        key: 'Region',
        isDropDown: true,
        dropDownValues: this.currentTabSupplierCountDetails?.regionList?.map((x) => ({ id: x.region, name: x.region }) as SearchKeyDropDownValue),
      },
    ];
  }
}
