import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
declare var $: any;
declare var bootstrap: any;

@Component({
  selector: 'asidebar',
  templateUrl: './offcanvas.component.html',
  styleUrls: ['./offcanvas.component.scss']
})
export class OffcanvasComponent implements OnInit {

  _showApplyBtn: boolean = true;
  _showCancelBtn: boolean = true;
  _applyBtnTxt: string = "SAVE";
  _cancelBtnTxt: string = "CLEAR";
  _backdrop: boolean = true;
  _keyboard: boolean = true;
  _scroll: boolean = false;
  _position: "start" | "end" | "top" | "bottom"  = "end";
  _title: string = "Filters";
  _openCanvas: boolean= false;
  offcanvas: any;

  @Input() set showApplyBtn(value: boolean) { this._showApplyBtn = value; }

  get showApplyBtn(): boolean { return this._showApplyBtn; }

  @Input() set showCancelBtn(value: boolean) { this._showCancelBtn = value; }

  get showCancelBtn(): boolean { return this._showCancelBtn; }

  @Input() set applyBtnTxt(value: string) { this._applyBtnTxt = value; }

  get applyBtnTxt(): string { return this._applyBtnTxt; }  
  
  @Input() set cancelBtnTxt(value: string) { this._cancelBtnTxt = value; }

  get cancelBtnTxt(): string { return this._cancelBtnTxt; }

  @Input() set backdrop(value: boolean) { this._backdrop = value; }

  get backdrop(): boolean { return this._backdrop; }

  @Input() set keyboard(value: boolean) { this._keyboard = value; }

  get keyboard(): boolean { return this._keyboard; }

  @Input() set scroll(value: boolean) { this._scroll = value; }

  get scroll(): boolean { return this._scroll; }

  @Input() set position(value: "start" | "end" | "top" | "bottom") { this._position = value; }

  get position(): "start" | "end" | "top" | "bottom" { return this._position; }

  @Input() set title(value: string) { this._title = value; }

  get title(): string { return this._title; }

  @Input() set openCanvas(value: boolean) {

    this.offcanvas = new bootstrap.Offcanvas(document.getElementById('offcanvas'), { 'backdrop': this.backdrop, 'scroll': this.scroll, 'keyboard': this.keyboard });
    
    this._openCanvas = value;

    if(this._openCanvas) this.offcanvas.show();

    else this.offcanvas.hide();

  }

  get openCanvas(): boolean { return this._openCanvas; }

  @Output() onSubmit: EventEmitter<any> = new EventEmitter();
  @Output() onCancel: EventEmitter<any> = new EventEmitter();
  @Output() onClose: EventEmitter<any> = new EventEmitter();

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
