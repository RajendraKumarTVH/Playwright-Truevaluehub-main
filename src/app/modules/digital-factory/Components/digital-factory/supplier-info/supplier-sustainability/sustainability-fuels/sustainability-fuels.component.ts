import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTable, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

interface FuelRow {
  description: string;
  annualVolume: number | null;
  unit: string;
}
@Component({
  selector: 'app-sustainability-fuels',
  standalone: true,
  templateUrl: './sustainability-fuels.component.html',
  styleUrl: './sustainability-fuels.component.scss',
  imports: [CommonModule, FormsModule, MatTableModule, MatIconModule, MatAutocompleteModule],
})
export class SustainabilityFuelsComponent {
  @ViewChild(MatTable) table!: MatTable<FuelRow>;
  displayedColumns: string[] = ['description', 'annualVolume', 'unit', 'action'];

  unitOptions: string[] = ['MT'];
  fuelOptions: string[] = ['Coal', 'Crude Oil', 'Natural Gas', 'Diesel', 'LPG'];

  fuels: FuelRow[] = [
    { description: 'Coal', annualVolume: 8000000, unit: 'MT' },
    { description: 'Crude Oil', annualVolume: 4800000, unit: 'MT' },
    { description: 'Natural Gas', annualVolume: 2500000, unit: 'MT' },
  ];

  addRow(): void {
    this.fuels.push({ description: '', annualVolume: null, unit: 'MT' });
    this.table.renderRows(); // <— force table to refresh
  }

  removeRow(index: number): void {
    this.fuels.splice(index, 1);
  }

  onFuelSelected(row: FuelRow, value: string): void {
    row.description = value;
  }

  onUnitSelected(row: FuelRow, value: string): void {
    row.unit = value;
  }
}
