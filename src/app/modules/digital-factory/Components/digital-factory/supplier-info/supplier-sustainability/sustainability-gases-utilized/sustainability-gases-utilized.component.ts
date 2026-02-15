import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTable, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AutoCompleteModule } from 'primeng/autocomplete';

interface GasRow {
  description: string;
  annualVolume: number | null;
  unit: string;
}

interface GasOption {
  name: string;
  tag: 'Refrigerant' | 'Industrial' | 'Fire Suppressant' | 'All';
  color: 'purple' | 'blue' | 'brown';
}

@Component({
  selector: 'app-sustainability-gases-utilized',
  imports: [CommonModule, FormsModule, MatTableModule, MatIconModule, MatAutocompleteModule, AutoCompleteModule],
  templateUrl: './sustainability-gases-utilized.component.html',
  styleUrl: './sustainability-gases-utilized.component.scss',
})
export class SustainabilityGasesUtilizedComponent implements OnInit {
  @ViewChild(MatTable) table!: MatTable<GasRow>;
  displayedColumns: string[] = ['description', 'annualVolume', 'unit', 'action'];

  unitOptions: string[] = ['MT'];

  gasRows: GasRow[] = [
    { description: 'Ammonia (R717)', annualVolume: 8000000, unit: 'MT' },
    { description: 'Argon (Ar)', annualVolume: 4800000, unit: 'MT' },
    { description: 'Carbon Dioxide (R744)', annualVolume: 2500000, unit: 'MT' },
  ];

  ngOnInit() {
    this.filterGases({ query: '' });
  }

  addRow(): void {
    this.gasRows.push({ description: '', annualVolume: null, unit: 'MT' });
    this.table.renderRows();
  }

  removeRow(index: number): void {
    this.gasRows.splice(index, 1);
  }

  onGasSelected(row: GasRow, value: string): void {
    row.description = value;
  }

  onUnitSelected(row: GasRow, value: string): void {
    row.unit = value;
  }

  gasOptions: GasOption[] = [
    { name: 'Ammonia (R717)', tag: 'Refrigerant', color: 'blue' },
    { name: 'Argon (Ar)', tag: 'Industrial', color: 'purple' },
    { name: 'Carbon Dioxide (R744)', tag: 'Refrigerant', color: 'blue' },
    { name: 'Halotron (HCFC‑123 / HFC blend)', tag: 'Fire Suppressant', color: 'brown' },
  ];

  filteredGases: GasOption[] = [];
  activeTag: GasOption['tag'] = 'All';

  filterGases(event: any) {
    const query = (event.query || '').toLowerCase();
    this.filteredGases = this.gasOptions.filter((g) => {
      const matchText = g.name.toLowerCase().includes(query);
      const matchTag = this.activeTag === 'All' || g.tag === this.activeTag;
      return matchText && matchTag;
    });
  }

  setTag(tag: GasOption['tag']) {
    this.activeTag = tag;
    this.filteredGases = this.gasOptions.filter((g) => (this.activeTag === 'All' ? true : g.tag === this.activeTag));
  }

  getGasByName(value: any): GasOption | null {
    if (!value) {
      return null;
    }

    if (typeof value === 'object' && 'name' in value) {
      return value as GasOption;
    }

    return this.gasOptions.find((g) => g.name === value) ?? null;
  }
}
