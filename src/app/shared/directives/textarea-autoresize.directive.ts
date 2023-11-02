import { Directive, HostListener, ElementRef, OnInit, Input } from '@angular/core';

@Directive({
  selector: '[textAreaResize]'
})
export class TextareaAutoresizeDirective implements OnInit {

  @Input() maxRows: number = 7;

  constructor(private elementRef: ElementRef) { }

  @HostListener(':input')
  onInput() {

    this.resize();

  }

  ngOnInit() {

    if(this.elementRef.nativeElement.scrollHeight) setTimeout(() => this.resize());

  }

  resize() {
    
    this.elementRef.nativeElement.style.height = '0';

    let rowsHeight = [30,48,68,88,109,129,150,170,190,211,231,251,272];

    if (this.elementRef.nativeElement.scrollHeight > rowsHeight[this.maxRows]) this.elementRef.nativeElement.style.height =  rowsHeight[this.maxRows] + 'px';

    else if(this.elementRef.nativeElement.scrollHeight < 30) this.elementRef.nativeElement.style.height = '30px';

    else this.elementRef.nativeElement.style.height =  (this.elementRef.nativeElement.scrollHeight + 2) + 'px';

  }

}