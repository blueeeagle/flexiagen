import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[noNumbers]'
})
export class NoNumericOnlyDirective {

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event']) onInput(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const currentValue = input.value;

    // Replace numeric characters with an empty string
    input.value = currentValue.replace(/[0-9]/g, '');
  }
}