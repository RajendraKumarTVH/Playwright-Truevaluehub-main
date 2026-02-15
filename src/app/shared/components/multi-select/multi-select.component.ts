import { Component, ElementRef, EventEmitter, HostListener, inject, Input, Output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-multi-select',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './multi-select.component.html',
  styleUrl: './multi-select.component.scss',
})
export class MultiSelectComponent {
  shareItems = signal<any[]>([]);

  @Input() set items(items: any[]) {
    this.shareItems.set(items);
    this.filteredItems.set(items);
  }
  @Input() placeHolder: string = '';
  @Output() selectionChange = new EventEmitter<any[]>();
  filteredItems = signal<any[]>([]);
  private elementRef = inject(ElementRef);
  isDropdownVisible = false;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownVisible = false;
    }
  }

  filterItems(event: Event) {
    const searchItem = (event.target as HTMLInputElement).value.toLocaleLowerCase();
    if (searchItem.trim()) {
      this.filteredItems.set(this.shareItems().filter((item) => item.name.toLowerCase().includes(searchItem)));
    } else {
      this.filteredItems.set(this.shareItems());
    }
  }

  toggleItem(item: any, event: MouseEvent) {
    event.stopPropagation();
    item.isSelected = !item.isSelected;
    this.selectionChange.emit(this.shareItems().filter((i) => i.isSelected));
  }

  removeItem(item: any, event: MouseEvent) {
    event.stopPropagation();
    item.isSelected = false;
    this.selectionChange.emit(this.shareItems().filter((i) => i.isSelected));
  }

  showDropdown() {
    this.isDropdownVisible = true;
  }
}
