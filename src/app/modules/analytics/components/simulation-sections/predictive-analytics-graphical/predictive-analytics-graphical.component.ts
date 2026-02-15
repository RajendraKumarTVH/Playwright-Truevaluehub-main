import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-predictive-analytics-graphical',
  templateUrl: './predictive-analytics-graphical.component.html',
  styleUrls: ['./predictive-analytics-graphical.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class PredictiveAnalyticsGraphicalComponent implements OnInit {
  @ViewChild('curvedLineChartCanvas', { static: true }) canvasRef: ElementRef;
  public chart: Chart;
  private ctx: CanvasRenderingContext2D;

  // Sample data
  private lineData = [
    [10, 25, 15, 30, 20, 25, 15, 30, 20, 35, 25],
    [15, 30, 20, 35, 25, 30, 20, 35, 25, 40, 30],
    [20, 35, 25, 40, 30, 35, 25, 40, 30, 45, 35],
  ];

  ngOnInit(): void {
    this.ctx = this.canvasRef.nativeElement.getContext('2d');
    this.drawCurvedLineChart();
  }

  drawCurvedLineChart(): void {
    this.chart = new Chart(this.ctx, {
      type: 'line',
      data: {
        labels: ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
        datasets: [
          {
            label: 'India',
            data: this.lineData[0],
            borderColor: '#5AA454', // Change the color as needed
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: false, // Fill the area under the line
            tension: 0.4, // Set line tension for curves
          },
          {
            label: 'US',
            data: this.lineData[1],
            borderColor: '#FF6347', // Change the color as needed
            backgroundColor: 'rgba(255, 99, 71, 0.2)',
            fill: false,
            tension: 0.4,
          },
          {
            label: 'Canada',
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
            // type: 'category',
            // labels: ['2016a', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
            title: {
              display: true,
              text: 'Year',
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
            text: 'Time Vs Cost per Country',
            font: {
              size: 20,
            },
          },
        },
      },
    });
  }
}
