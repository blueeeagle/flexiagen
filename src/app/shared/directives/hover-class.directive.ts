import { Directive, HostListener, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[hoverClass]'
})
export class HoverClassDirective {

  constructor(public elementRef:ElementRef) { }
  @Input('hoverClass') hoverClass:any;  
  
  @HostListener('mouseenter') onMouseEnter() {
    this.elementRef.nativeElement.classList.add(this.hoverClass);
 }

  @HostListener('mouseleave') onMouseLeave() {
    this.elementRef.nativeElement.classList.remove(this.hoverClass);
  }
  
}
