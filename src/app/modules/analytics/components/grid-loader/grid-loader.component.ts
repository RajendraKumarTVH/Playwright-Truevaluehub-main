import { Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-grid-loader',
  templateUrl: './grid-loader.component.html',
  styleUrls: ['./grid-loader.component.scss'],
  standalone: true,
  imports: [SkeletonModule, CommonModule],
})
export class GridLoaderComponent {
  cols = Array.from({ length: 9 });
  rows = Array.from({ length: 10 });
}
