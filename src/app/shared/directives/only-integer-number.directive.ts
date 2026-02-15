import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[OnlyIntegerNumber]',
  standalone: true,
})
export class OnlyIntegerNumber {
  constructor(private el: ElementRef) {}
  regexStr = '^[0-9]*$';
  @Input() OnlyIntegerNumber: boolean;

  @HostListener('keydown', ['$event']) onKeyDown(event: any) {
    const e = <KeyboardEvent>event;
    if (this.OnlyIntegerNumber) {
      if (e.key == '-' || e.key == '+' || e.key == 'e' || e.key == '.') {
        event.preventDefault();
      } else if (
        [46, 8, 9, 27, 13, 190].indexOf(e.keyCode) !== -1 ||
        // Allow: Ctrl+A
        (e.keyCode === 65 && (e.ctrlKey || e.metaKey)) ||
        // Allow: Ctrl+C
        (e.keyCode === 67 && (e.ctrlKey || e.metaKey)) ||
        // Allow: Ctrl+V
        (e.keyCode === 86 && (e.ctrlKey || e.metaKey)) ||
        // Allow: Ctrl+X
        (e.keyCode === 88 && (e.ctrlKey || e.metaKey)) ||
        // Allow: home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 39)
      ) {
        // let it happen, don't do anything
        return;
      }
      const ch = String.fromCharCode(e.keyCode);
      const regEx = new RegExp(this.regexStr);
      if (regEx.test(ch)) return;
      else e.preventDefault();
    }
  }
}
