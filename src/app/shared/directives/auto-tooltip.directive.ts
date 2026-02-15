import { Directive, ElementRef, Renderer2, AfterViewInit } from '@angular/core';

@Directive({
  selector: 'label.form-label',
})
export class AutoTooltipDirective implements AfterViewInit {
  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit(): void {
    const label: HTMLElement = this.el.nativeElement;
    const labelText: HTMLElement | null = label.querySelector('.label-text');
    const target = labelText || label;
    // Extract visible text without excessive whitespace
    let rawText = target.textContent || '';
    let cleanedText = rawText.replace(/\s+/g, ' ').trim();

    if (cleanedText) {
      this.renderer.setAttribute(target, 'title', cleanedText);
    }
  }
}
