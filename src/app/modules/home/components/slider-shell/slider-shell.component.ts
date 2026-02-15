import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-slider-shell',
  templateUrl: './slider-shell.component.html',
  styleUrls: ['./slider-shell.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule],
})
export class SliderShellComponent {
  @Input() isVisible: boolean = false;
  @Output() closeSlider = new EventEmitter<void>();

  onClose() {
    this.closeSlider.emit();
  }
}
