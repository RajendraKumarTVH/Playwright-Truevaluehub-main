import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SearchBarModelDto } from '../../models/search-bar-model';
import { SearchKeyDropDownValue, SearchKeyModel } from '../../models/search-key-model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { searchTypeContains, searchTypeDoesNotContains, searchTypeIs, searchTypeNot } from '../../constants/constant';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatOptionModule, MatAutocompleteModule, MatSelectModule, MatAutocompleteModule],
})
export class SearchBarComponent implements OnInit {
  @Input() searchKeys: SearchKeyModel[] = [];
  @Input() searchTypes: string[] = [searchTypeIs, searchTypeNot, searchTypeContains, searchTypeDoesNotContains];
  @Input() previousSearch: SearchBarModelDto[];
  @Output() searchApply = new EventEmitter<SearchBarModelDto[]>();

  selectedSearchKey?: SearchKeyModel;
  selectedSearchType?: string = 'Is';
  searchedValue?: string;
  searchIndex = 0;
  selectedDropDownValue?: string;
  appliedFilters: SearchBarModelDto[] = [];
  filteredDropDownValues: SearchKeyDropDownValue[];

  ngOnInit(): void {
    this.appliedFilters = this.previousSearch ?? [];
  }

  onSearchKeyChange() {
    this.filteredDropDownValues = this.selectedSearchKey.dropDownValues;
  }

  filterOptions() {
    if (!this.searchedValue) {
      this.filteredDropDownValues = this.selectedSearchKey.dropDownValues;
      return;
    }
    this.filteredDropDownValues = this.selectedSearchKey.dropDownValues.filter((x) => x.name.toLowerCase().includes(this.searchedValue.toLowerCase()));
  }

  onSearchFilterApply() {
    this.appliedFilters = [...this.appliedFilters]; // ensure mutability
    this.appliedFilters.push({
      index: this.searchIndex++,
      searchKey: this.selectedSearchKey.key,
      searchType: this.selectedSearchType,
      searchValue: this.searchedValue,
      searchLabel: this.selectedSearchKey.label,
    });

    this.searchApply.emit(this.appliedFilters);
    this.searchedValue = '';
  }

  // Add this method to your component class
  openDatePicker(event) {
    event.stopPropagation();
    const dateInput = document.querySelector('.date-input') as HTMLInputElement;
    if (dateInput && !dateInput.disabled) {
      dateInput.focus();
      dateInput.showPicker();
    }
  }
  // removeFilter(filter: SearchBarModelDto) {
  //   this.appliedFilters.splice(filter.index, 1);
  //   this.searchApply.emit(this.appliedFilters);
  //   if (this.appliedFilters.length === 0) this.searchIndex = 0;
  // }

  removeFilter(filter: SearchBarModelDto) {
    this.appliedFilters = this.appliedFilters.filter((f) => f.index !== filter.index);
    this.searchApply.emit(this.appliedFilters);
    if (this.appliedFilters.length === 0) this.searchIndex = 0;
  }

  onSearchClear() {
    this.appliedFilters = [];
    this.searchIndex = 0;
    this.searchApply.emit(this.appliedFilters);
  }

  ondropDownChange(event: any) {
    console.log(event);
  }
}
