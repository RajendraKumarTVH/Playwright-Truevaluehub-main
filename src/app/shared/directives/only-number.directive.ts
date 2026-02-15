import { Directive, ElementRef, Input, HostListener } from '@angular/core';

@Directive({
  selector: '[OnlyNumber]',
  standalone: true,
})
export class OnlyNumber {
  constructor(private el: ElementRef) {}
  regexStr = '^[0-9]*$';
  @Input() OnlyNumber: boolean;

  @HostListener('keydown', ['$event']) onKeyDown(event: any) {
    const e = <KeyboardEvent>event;
    if (this.OnlyNumber) {
      if (
        ['Delete', 'Backspace', 'Tab', 'Escape', 'Enter', 'NumpadDecimal', 'Period', '.'].includes(e.key) ||
        // Allow: Ctrl+A
        (e.key.toLowerCase() === 'a' && (e.ctrlKey || e.metaKey)) ||
        // Allow: Ctrl+C
        (e.key.toLowerCase() === 'c' && (e.ctrlKey || e.metaKey)) ||
        // Allow: Ctrl+V
        (e.key.toLowerCase() === 'v' && (e.ctrlKey || e.metaKey)) ||
        // Allow: Ctrl+X
        (e.key.toLowerCase() === 'x' && (e.ctrlKey || e.metaKey)) ||
        // Allow: home, end, left, right
        ['Home', 'End', 'ArrowLeft', 'ArrowRight'].includes(e.key)
      ) {
        // let it happen, don't do anything
        return;
      }
      const regEx = new RegExp(this.regexStr);
      if (regEx.test(e.key)) return;
      else e.preventDefault();
    }
  }
}
