import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { PartInfoDto } from 'src/app/shared/models';
import { PcbBoarddetailsComponent } from '../pcb-boarddetails/pcb-boarddetails.component';

@Component({
  selector: 'app-bom-input-analysis',
  templateUrl: './bom-input-analysis.component.html',
  styleUrls: ['./bom-input-analysis.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatExpansionModule, PcbBoarddetailsComponent],
})
export class BomInputAnalysisComponent {
  @Input() partDto: PartInfoDto;
}
