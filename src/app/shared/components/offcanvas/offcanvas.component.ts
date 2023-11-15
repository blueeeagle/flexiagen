import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
declare var $: any;
declare var bootstrap: any;

@Component({
  selector: 'asidebar',
  templateUrl: './offcanvas.component.html',
  styleUrls: ['./offcanvas.component.scss']
})
export class OffcanvasComponent implements OnInit {

  @Input() showApplyBtn: boolean = true;
  @Input() showCancelBtn: boolean = true;
  @Input() applyBtnTxt: string = "Apply";
  @Input() backdrop: boolean = true;
  @Input() keyboard: boolean = true;
  @Input() scroll: boolean = false;
  @Input() position: "start" | "end" | "top" | "bottom"  = "end"; 

  @Output() onSubmit: EventEmitter<any> = new EventEmitter();
  @Output() onClose: EventEmitter<any> = new EventEmitter();

  canvasTitle: string = "Filters";
  isCanvasOpen: boolean= false;
  offcanvas: any ;

  get title(): string {

    return this.canvasTitle;

  }
  
  @Input() set title(value: string) {
    
    this.canvasTitle = value;

  }

  @Input() set openCanvas(value: boolean) {

    this.offcanvas = new bootstrap.Offcanvas(document.getElementById('offcanvas'), { 'backdrop': this.backdrop, 'scroll': this.scroll, 'keyboard': this.keyboard });
    
    this.isCanvasOpen = value;

    if(this.isCanvasOpen) this.offcanvas.show();

  }

  get openCanvas(): boolean { return this.isCanvasOpen; }
  

  constructor() { }

  ngOnInit(): void { 

    const canvas: any = document.getElementById('offcanvas');

    canvas.addEventListener('hidden.bs.offcanvas', () => {

      this.offcanvas.hide();

      this.onClose.emit();  
    
    });

  }


  close() {
    
    this.offcanvas.hide();

    this.onClose.emit();

  }

}
