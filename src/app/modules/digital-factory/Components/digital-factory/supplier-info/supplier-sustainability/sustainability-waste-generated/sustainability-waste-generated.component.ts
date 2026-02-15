import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
interface WasteRow {
  group: string;
  description: string;
  unit: string;
  annualVolume: number | null;
  landfilled: number | null;
  recycled: number | null;
  composted: number | null;
  incinerated: number | null;
  reused: number | null;
}
@Component({
  selector: 'app-sustainability-waste-generated',
  imports: [CommonModule, FormsModule, MatTableModule, MatIconModule],
  templateUrl: './sustainability-waste-generated.component.html',
  styleUrl: './sustainability-waste-generated.component.scss',
})
export class SustainabilityWasteGeneratedComponent {
  displayedColumns = ['description', 'annualVolume', 'landfilled', 'recycled', 'composted', 'incinerated', 'reused', 'total'];

  rows: WasteRow[] = [
    { group: 'Solid Waste', description: 'Plastic', unit: 'MT', annualVolume: 1000, landfilled: 0, recycled: 100, composted: 0, incinerated: 0, reused: 0 },
    { group: 'Solid Waste', description: 'Metal', unit: 'MT', annualVolume: 2000, landfilled: 0, recycled: 80, composted: 0, incinerated: 0, reused: 20 },
    { group: 'Solid Waste', description: 'Packaging', unit: 'MT', annualVolume: 300, landfilled: 0, recycled: 60, composted: 0, incinerated: 0, reused: 40 },
    { group: 'Solid Waste', description: 'Refrigerants/Chemicals', unit: 'L', annualVolume: null, landfilled: null, recycled: null, composted: null, incinerated: null, reused: null },
    { group: 'Solid Waste', description: 'e‑waste', unit: 'MT', annualVolume: null, landfilled: null, recycled: null, composted: null, incinerated: null, reused: null },
    { group: 'Water Waste', description: 'Water Waste', unit: 'L', annualVolume: null, landfilled: null, recycled: null, composted: null, incinerated: null, reused: null },
    { group: 'Hazardous Waste', description: 'Hazardous Waste', unit: 'kg', annualVolume: null, landfilled: null, recycled: null, composted: null, incinerated: null, reused: null },
  ];

  // grouped representation used by template
  groups: { group: string; items: WasteRow[] }[] = [];

  constructor() {
    this.buildGroups();
  }

  private buildGroups() {
    const map = new Map<string, WasteRow[]>();
    for (const r of this.rows) {
      if (!map.has(r.group)) map.set(r.group, []);
      map.get(r.group)!.push(r);
    }
    this.groups = Array.from(map.entries()).map(([group, items]) => ({ group, items }));
  }

  getTotal(row: WasteRow): number | null {
    const vals = [row.landfilled, row.recycled, row.composted, row.incinerated, row.reused].filter((v) => v !== null && v !== undefined) as number[];
    return vals.length ? vals.reduce((a, b) => a + b, 0) : null;
  }
}
