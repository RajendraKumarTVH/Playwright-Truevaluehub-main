import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SearchTextLinkModel, SearchTextViewModel } from '../../models';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-text',
  templateUrl: './search-text.component.html',
  styleUrls: ['./search-text.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class SearchTextComponent {
  @Input() searchViewList: SearchTextViewModel[];
  @Output() selecLink: EventEmitter<SearchTextLinkModel> = new EventEmitter<SearchTextLinkModel>();

  public onSelect(obj: SearchTextLinkModel) {
    this.selecLink.emit(obj);
  }
}
