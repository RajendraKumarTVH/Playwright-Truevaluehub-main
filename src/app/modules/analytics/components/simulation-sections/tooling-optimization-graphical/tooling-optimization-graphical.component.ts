import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-tooling-optimization-graphical',
  templateUrl: './tooling-optimization-graphical.component.html',
  styleUrls: ['./tooling-optimization-graphical.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class ToolingOptimizationGraphicalComponent implements OnInit {
  @ViewChild('curvedLineChartCanvas', { static: true }) canvasRef: ElementRef;
  public chart: Chart;
  // private ctx: CanvasRenderingContext2D;

  // Sample data
  private lineData = [
    [10, 25, 15, 30, 20, 25],
    [15, 30, 20, 35, 25, 30],
    [20, 35, 25, 40, 30, 35],
  ];

  ngOnInit(): void {
    // this.ctx = this.canvasRef.nativeElement.getContext('2d');
    this.drawCurvedLineChart();
  }

  drawCurvedLineChart(): void {
    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: 'line',
      data: {
        labels: ['2', '4', '8', '12', '16', '24'],
        datasets: [
          {
            label: 'Tooling Cost',
            data: this.lineData[0],
            borderColor: 'rgba(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: false, // Fill the area under the line
            tension: 0.4, // Set line tension for curves
          },
          {
            label: 'Manufacturing Cost',
            data: this.lineData[1],
            borderColor: 'rgb(134, 43, 13)',
            backgroundColor: 'rgb(134, 43, 13, 0.2)',
            fill: false,
            tension: 0.4,
          },
          {
            label: 'Total Cost',
            data: this.lineData[2],
            borderColor: 'rgba(147, 112, 219)',
            backgroundColor: 'rgba(147, 112, 219, 0.2)',
            fill: false,
            tension: 0.4,
          },
        ],
      },
      options: {
        scales: {
          x: {
            // type: 'category',
            // labels: ['Cav 1', 'Cav 2', 'Cav 3', 'Cav 4', 'Cav 5'],
            title: {
              display: true,
              text: 'Cavities Count',
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
            text: 'Cavities vs Cost',
            font: {
              size: 20,
            },
          },
        },
      },
    });
  }
}
