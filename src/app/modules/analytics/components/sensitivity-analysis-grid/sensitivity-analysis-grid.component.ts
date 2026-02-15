import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

interface CostDriver {
  name: string;
  currentValue: number;
  pastChange12M: number;
  futureChange12M: number;
  stdDev: number;
  volatility: string;
  negativeChange: number;
  positiveChange: number;
  negativePercentage: number;
  positivePercentage: number;
  negativeChangePercent: number;
  positiveChangePercent: number;
  isNew?: boolean;
}

@Component({
  selector: 'app-sensitivity-analysis-grid',
  templateUrl: './sensitivity-analysis-grid.component.html',
  styleUrls: ['./sensitivity-analysis-grid.component.scss'],
  standalone: true,
  imports: [TableModule, ButtonModule, CommonModule, FormsModule, MatIconModule, MatAutocompleteModule],
})
export class SensitivityAnalysisGridComponent implements OnInit {
  costDrivers: CostDriver[] = [];
  showModal = false;
  availableCostDrivers: string[] = ['Material Cost', 'Scrap Cost', 'Machine Cost', 'Labour Cost', 'Setup', 'Profit', 'Overhead', 'Tooling', 'Packaging', 'Logistics', 'Duties & Tariff'];

  ngOnInit() {
    this.costDrivers = [
      {
        name: 'Material Cost',
        currentValue: 20,
        pastChange12M: -20,
        futureChange12M: 20,
        stdDev: 4,
        volatility: 'High',
        negativeChange: -10,
        positiveChange: 10,
        negativePercentage: 37,
        positivePercentage: 40,
        negativeChangePercent: -37,
        positiveChangePercent: 40,
      },
      {
        name: 'Scrap Cost',
        currentValue: 10,
        pastChange12M: -10,
        futureChange12M: 10,
        stdDev: 3,
        volatility: 'Medium',
        negativeChange: -10,
        positiveChange: 10,
        negativePercentage: 29,
        positivePercentage: 22,
        negativeChangePercent: -29,
        positiveChangePercent: 22,
      },
      {
        name: 'Machine Cost',
        currentValue: 5,
        pastChange12M: -10,
        futureChange12M: 10,
        stdDev: 2,
        volatility: 'Low',
        negativeChange: -10,
        positiveChange: 10,
        negativePercentage: 29,
        positivePercentage: 22,
        negativeChangePercent: -29,
        positiveChangePercent: 22,
      },
      {
        name: 'Labour Cost',
        currentValue: 3.6,
        pastChange12M: -10,
        futureChange12M: 10,
        stdDev: 1.1,
        volatility: 'Low',
        negativeChange: -10,
        positiveChange: 10,
        negativePercentage: 29,
        positivePercentage: 22,
        negativeChangePercent: -29,
        positiveChangePercent: 22,
      },
      {
        name: 'Setup',
        currentValue: 45,
        pastChange12M: -45,
        futureChange12M: 45,
        stdDev: 0,
        volatility: 'Low',
        negativeChange: -10,
        positiveChange: 10,
        negativePercentage: 25,
        positivePercentage: 19,
        negativeChangePercent: -25,
        positiveChangePercent: 19,
      },
      {
        name: 'Profit',
        currentValue: 12,
        pastChange12M: -12,
        futureChange12M: 12,
        stdDev: 6,
        volatility: 'High',
        negativeChange: -10,
        positiveChange: 10,
        negativePercentage: 25,
        positivePercentage: 19,
        negativeChangePercent: -25,
        positiveChangePercent: 19,
      },
      {
        name: 'Overhead',
        currentValue: 4.5,
        pastChange12M: -4.5,
        futureChange12M: 4.5,
        stdDev: 7,
        volatility: 'High',
        negativeChange: -10,
        positiveChange: 10,
        negativePercentage: 23,
        positivePercentage: 19,
        negativeChangePercent: -23,
        positiveChangePercent: 19,
      },
      {
        name: 'Tooling',
        currentValue: 30,
        pastChange12M: -30,
        futureChange12M: 30,
        stdDev: 8,
        volatility: 'High',
        negativeChange: -10,
        positiveChange: 10,
        negativePercentage: 23,
        positivePercentage: 16,
        negativeChangePercent: -23,
        positiveChangePercent: 16,
      },
      {
        name: 'Packaging',
        currentValue: 11,
        pastChange12M: -11,
        futureChange12M: 11,
        stdDev: 9,
        volatility: 'High',
        negativeChange: -10,
        positiveChange: 10,
        negativePercentage: 19,
        positivePercentage: 10,
        negativeChangePercent: -19,
        positiveChangePercent: 10,
      },
      {
        name: 'Logistics',
        currentValue: 4.9,
        pastChange12M: -4.9,
        futureChange12M: 4.9,
        stdDev: 10,
        volatility: 'High',
        negativeChange: -10,
        positiveChange: 10,
        negativePercentage: 18,
        positivePercentage: 10,
        negativeChangePercent: -18,
        positiveChangePercent: 10,
      },
      {
        name: 'Duties & Tariff',
        currentValue: 11,
        pastChange12M: -11,
        futureChange12M: 11,
        stdDev: 11,
        volatility: 'High',
        negativeChange: -10,
        positiveChange: 10,
        negativePercentage: 16,
        positivePercentage: 8,
        negativeChangePercent: -16,
        positiveChangePercent: 8,
      },
    ];
  }

  deleteDriver(driver: CostDriver) {
    this.costDrivers = this.costDrivers.filter((d) => d !== driver);
  }

  addDriver() {
    const newDriver: CostDriver = {
      name: 'New Driver',
      currentValue: 0,
      pastChange12M: 0,
      futureChange12M: 0,
      stdDev: 0,
      volatility: 'Low',
      negativeChange: -10,
      positiveChange: 10,
      negativePercentage: 20,
      positivePercentage: 20,
      negativeChangePercent: -20,
      positiveChangePercent: 20,
      isNew: true,
    };
    this.costDrivers = [...this.costDrivers, newDriver];
  }

  openChangeModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
}
