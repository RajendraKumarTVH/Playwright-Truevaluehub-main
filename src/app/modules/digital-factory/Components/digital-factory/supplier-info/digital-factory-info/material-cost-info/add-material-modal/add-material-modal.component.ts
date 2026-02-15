import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Store } from '@ngxs/store';
import moment from 'moment';
import { map, Observable, of, startWith, Subject, takeUntil } from 'rxjs';
import { CountryDataState } from 'src/app/modules/_state/country.state';
import { DigitalFactoryCommonService } from 'src/app/modules/digital-factory/Components/Shared/digital-factory-common-service';
import { EditPageBase } from 'src/app/modules/digital-factory/Components/Shared/edit-state/edit-page.base';
import { EditToolbarComponent } from 'src/app/modules/digital-factory/Components/Shared/edit-toolbar/edit-toolbar.component';
import { DfMaterialInfoDto } from 'src/app/modules/digital-factory/Models/df-material-info-dto';
import { DigitalFactoryService } from 'src/app/modules/digital-factory/Service/digital-factory.service';
import { MaterialCategoryList, SelectModel } from 'src/app/shared/enums/material-category-map.enum';
import { CountryDataMasterDto } from 'src/app/shared/models/country-data-master.model';
import { MaterialMasterDto } from 'src/app/shared/models/material-master.model';
import { MaterialTypeDto } from 'src/app/shared/models/material-type.model';
import { MaterialMasterService } from 'src/app/shared/services';

@Component({
  selector: 'app-add-material-modal',
  templateUrl: './add-material-modal.component.html',
  styleUrls: ['./add-material-modal.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, EditToolbarComponent, MatAutocompleteModule, MatIconModule, MatFormFieldModule, MatInputModule, MatDatepickerModule],
})
export class AddMaterialComponent extends EditPageBase<DfMaterialInfoDto> implements OnInit, OnDestroy {
  @Input() selectedMaterialInfo?: DfMaterialInfoDto;
  @Output() materialAdded = new EventEmitter<DfMaterialInfoDto>();
  form!: FormGroup;
  filterdMaterialGroupList?: Observable<any>;
  materialGroupListControl = new FormControl();
  filteredGroups$: Observable<any>;
  filteredCountries$: Observable<any>;
  filteredMaterialTypes$: Observable<any>;
  filteredMaterialMasters$: Observable<any>;
  filteredStockForms$: Observable<any>;
  private materialGroupList = [];
  private materialTypeList = [];
  private materialDescriptionList = [];
  private stockFormList = [];
  private countryList = [];
  private readonly unsubscribe$: Subject<undefined> = new Subject<undefined>();
  _countryMaster$: Observable<CountryDataMasterDto[]>;

  constructor(
    private readonly store: Store,
    private readonly digitalFactoryService: DigitalFactoryService,
    private readonly materialMasterService: MaterialMasterService,
    private readonly digitalFactoryCommonService: DigitalFactoryCommonService,
    readonly fb: FormBuilder
  ) {
    super(fb);
    this._countryMaster$ = this.store.select(CountryDataState.getCountryData);
  }

  ngOnInit() {
    this.form = this.fb.group({
      digitalFactoryId: [[Validators.required]],
      digitalFactoryMaterialInfoId: [],
      materialGroup: [],
      materialGroupId: [[Validators.required]],
      materialType: [],
      materialTypeId: [[Validators.required]],
      materialDescription: [],
      materialMasterId: [[Validators.required]],
      stockFormId: [],
      stockForm: [],
      volumePurchased: [],
      discountPercent: [],
      price: [[Validators.required]],
      scrapPrice: [],
      countryOfOrigin: [],
      countryOfOriginName: [],
      effectiveDate: [],
    });
    this.initEditPage();
    this.setMaterialGroup();
    this.setCountryList();
  }

  load(): Observable<DfMaterialInfoDto> {
    return of(this.selectedMaterialInfo);
  }

  buildForm(data: DfMaterialInfoDto): FormGroup {
    this.form.patchValue({
      digitalFactoryId: this.digitalFactoryCommonService.digitalFacotryDetails?.digitalFactoryId,
      digitalFactoryMaterialInfoId: data?.digitalFactoryMaterialInfoId,
      materialGroup: data?.materialGroup,
      materialGroupId: data?.materialGroupId,
      materialType: data?.materialType,
      materialTypeId: data?.materialTypeId,
      materialDescription: data?.materialDescription,
      materialMasterId: data?.materialMasterId,
      stockFormId: data?.stockFormId,
      stockForm: data?.stockForm,
      volumePurchased: data?.volumePurchased,
      discountPercent: data?.discountPercent,
      price: data?.price,
      scrapPrice: data?.scrapPrice,
      countryOfOrigin: data?.countryOfOrigin,
      countryOfOriginName: data?.countryOfOriginName,
      effectiveDate: data?.effectiveDate,
    });
    if (data?.materialGroupId) {
      this.onMaterialGroupChange({ option: { value: data.materialGroupId } } as MatAutocompleteSelectedEvent);
    }
    return this.form;
  }

  saveApi(data: DfMaterialInfoDto): Observable<DfMaterialInfoDto> {
    if (this.form.get('price').dirty) {
      data.digitalFactoryMaterialInfoId = undefined;
      return this.digitalFactoryService.addDigitalFactoryMaterialCostInfo(data).pipe(takeUntil(this.unsubscribe$));
    }

    return this.digitalFactoryService.updateDigitalFactoryMaterialCostInfo(data).pipe(takeUntil(this.unsubscribe$));
  }

  afterSaveApi(data: DfMaterialInfoDto) {
    const materialGroupId = this.form.get('materialGroupId')?.value;
    const materialTypeId = this.form.get('materialTypeId')?.value;
    const stockFormId = this.form.get('stockFormId')?.value;
    data.materialGroupId = materialGroupId;
    data.materialTypeId = materialTypeId;
    data.stockFormId = stockFormId;
    data.stockForm = this.stockFormList?.find((s) => s.stockFormId === data.stockFormId)?.formName;
    data.materialGroup = this.materialGroupList?.find((g) => g.id === materialGroupId)?.name;
    data.materialType = this.materialTypeList?.find((t) => t.materialTypeId === materialTypeId)?.materialTypeName;
    data.materialDescription = this.materialDescriptionList.find((m) => m.materialMasterId === data.materialMasterId)?.materialDescription;
    data.countryOfOriginName = this.countryList?.find((c) => c.countryId === data.countryOfOrigin)?.countryName;
    this.materialAdded.emit(data);
  }

  ngOnDestroy() {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }

  onMaterialGroupChange(event: MatAutocompleteSelectedEvent): void {
    const groupId = event.option.value;
    if (groupId) {
      this.materialMasterService
        .getMaterialTypesByStockFormId(groupId, null)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((result: MaterialTypeDto[]) => {
          if (result) {
            this.materialTypeList = result;
            this.filteredMaterialTypes$ = this.form.get('materialTypeId')?.valueChanges.pipe(
              startWith(''),
              map((value) => this.getFilteredDropdownValues('materialType', value))
            );

            const selectedMaterialTypeId = this.form.get('materialTypeId').value;
            if (selectedMaterialTypeId) {
              this.onMaterialTypeChange({ option: { value: selectedMaterialTypeId } } as MatAutocompleteSelectedEvent);
              this.form.patchValue({
                materialTypeId: selectedMaterialTypeId,
              });
            }
          }
        });
    }
  }

  onMaterialTypeChange(event: MatAutocompleteSelectedEvent): void {
    const typeId = event.option.value;
    if (typeId) {
      this.materialMasterService
        .getmaterialsByMaterialTypeId(typeId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((result: MaterialMasterDto[]) => {
          if (result) {
            this.materialDescriptionList = result;
            this.filteredMaterialMasters$ = this.form.get('materialMasterId')?.valueChanges.pipe(
              startWith(''),
              map((value) => this.getFilteredDropdownValues('materialMaster', value))
            );

            const selectedMaterialMasterId = this.form.get('materialMasterId').value;
            if (selectedMaterialMasterId) {
              this.onMaterialDescriptionChange({ option: { value: selectedMaterialMasterId } } as MatAutocompleteSelectedEvent);
              this.form.patchValue({
                materialMasterId: selectedMaterialMasterId,
              });
            }
          }
        });
    }
  }

  onMaterialDescriptionChange(event: MatAutocompleteSelectedEvent): void {
    if (event.option.value) {
      const materialMaster = this.materialDescriptionList.find((option) => option.materialMasterId == event.option.value);
      this.stockFormList = materialMaster?.stockForms;
      this.filteredStockForms$ = this.form.get('stockFormId')?.valueChanges.pipe(
        startWith(''),
        map((value) => this.getFilteredDropdownValues('stockForm', value))
      );
      const selectedStockFormId = this.form.get('stockFormId').value;
      this.form.patchValue({
        stockFormId: selectedStockFormId,
      });
    }
  }

  setMonthAndYear(normalizedMonth: moment.Moment, datepicker: any) {
    const ctrlValue = this.form.get('effectiveDate')?.value || moment();

    ctrlValue.month(normalizedMonth.month());
    ctrlValue.year(normalizedMonth.year());

    this.form.get('effectiveDate')?.setValue(ctrlValue);
    datepicker.close();
  }

  private setMaterialGroup() {
    this.materialGroupList = [];
    for (let x of MaterialCategoryList.keys()) {
      const obj = new SelectModel();
      obj.id = x;
      obj.name = MaterialCategoryList.get(x) || '';
      this.materialGroupList.push(obj);
    }
    this.filteredGroups$ = this.form.get('materialGroupId')?.valueChanges.pipe(
      startWith(''),
      map((value) => this.getFilteredDropdownValues('materialGroup', value))
    );
  }

  private setCountryList() {
    this._countryMaster$.pipe(takeUntil(this.unsubscribe$)).subscribe((res) => {
      this.countryList = res;
      this.filteredCountries$ = this.form.get('countryOfOrigin')?.valueChanges.pipe(
        startWith(''),
        map((value) => this.getFilteredDropdownValues('country', value))
      );
    });
  }
  displayGroupName = (id: number) => this.materialGroupList.find((g) => g.id === id)?.name || '';

  displayMaterialTypeName = (id: number) => this.materialTypeList.find((g) => g.materialTypeId === id)?.materialTypeName || '';

  displayMaterialMasterName = (id: number) => this.materialDescriptionList.find((g) => g.materialMasterId === id)?.materialDescription || '';

  displayStockFormName = (id: number) => this.stockFormList.find((g) => g.stockFormId === id)?.formName || '';

  displayCountryName = (id: number) => this.countryList.find((g) => g.countryId === id)?.countryName || '';

  getFilteredDropdownValues(key: string, value: string | number) {
    const filterValue = typeof value === 'string' ? value.toLowerCase() : '';
    switch (key) {
      case 'materialGroup':
        return this.materialGroupList.filter((group) => group.name.toLowerCase().includes(filterValue));
      case 'materialType':
        if (!filterValue) return this.materialTypeList;
        return this.materialTypeList.filter((type) => type.materialTypeName.toLowerCase().includes(filterValue));
      case 'materialMaster':
        if (!filterValue) return this.materialDescriptionList;
        return this.materialDescriptionList.filter((material) => material.materialDescription.toLowerCase().includes(filterValue));
      case 'country':
        if (!filterValue) return this.countryList;
        return this.countryList.filter((country) => country.countryName.toLowerCase().includes(filterValue));
      case 'stockForm':
        if (!filterValue) return this.stockFormList;
        return this.stockFormList.filter((stockForm) => stockForm.formName.toLowerCase().includes(filterValue));
      default:
        return [];
    }
  }
}
