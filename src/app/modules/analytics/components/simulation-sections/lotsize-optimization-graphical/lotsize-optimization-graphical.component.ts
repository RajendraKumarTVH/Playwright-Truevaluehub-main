import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-lotsize-optimization-graphical',
  templateUrl: './lotsize-optimization-graphical.component.html',
  styleUrls: ['./lotsize-optimization-graphical.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class LotsizeOptimizationGraphicalComponent implements OnInit {
  @ViewChild('curvedLineChartCanvas', { static: true }) canvasRef: ElementRef;
  public chart: Chart;
  private ctx: CanvasRenderingContext2D;

  // Sample data
  private lineData = [
    [10, 25, 15, 30, 20],
    [15, 30, 20, 35, 25],
    [20, 35, 25, 40, 30],
  ];

  ngOnInit(): void {
    this.ctx = this.canvasRef.nativeElement.getContext('2d');
    this.drawCurvedLineChart();
  }

  drawCurvedLineChart(): void {
    this.chart = new Chart(this.ctx, {
      type: 'line',
      data: {
        labels: ['Lot 1', 'Lot 2', 'Lot 3', 'Lot 4', 'Lot 5'],
        datasets: [
          {
            label: 'Cost 1',
            data: this.lineData[0],
            borderColor: '#5AA454', // Change the color as needed
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: false, // Fill the area under the line
            tension: 0.4, // Set line tension for curves
          },
          {
            label: 'Cost 2',
            data: this.lineData[1],
            borderColor: '#FF6347', // Change the color as needed
            backgroundColor: 'rgba(255, 99, 71, 0.2)',
            fill: false,
            tension: 0.4,
          },
          {
            label: 'Cost 3',
            data: this.lineData[2],
            borderColor: '#9370DB', // Change the color as needed
            backgroundColor: 'rgba(147, 112, 219, 0.2)',
            fill: false,
            tension: 0.4,
          },
        ],
      },
      options: {
        scales: {
          x: {
            type: 'category',
            labels: ['Lot 1', 'Lot 2', 'Lot 3', 'Lot 4', 'Lot 5'],
            title: {
              display: true,
              text: 'Lot Size',
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Cost ($)',
            },
          },
        },
        plugins: {
          title: {
            display: true,
            text: 'Lot Size Vs Cost',
            font: {
              size: 20,
            },
          },
        },
      },
    });
  }
}
