import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { PartInfoDto } from 'src/app/shared/models';

@Component({
  selector: 'app-bom-output-analysis',
  templateUrl: './bom-output-analysis.component.html',
  styleUrls: ['./bom-output-analysis.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatExpansionModule],
})
export class BomOutputAnalysisComponent {
  @Input() partDto: PartInfoDto;
}
