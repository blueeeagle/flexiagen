import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'success-modal',
  templateUrl: './success-modal.component.html',
  styleUrls: ['./success-modal.component.scss']
})
export class SuccessModalComponent {

  @Input() className      : string = "";
  @Input() backdrop       : any = "static";
  @Input() size           : 'sm' | 'md' | 'lg' | 'xl' = "md";
  @Input() showCloseIcon  : boolean = true;
  @Input() animation      : boolean = true;
  @Input() centered       : boolean = true;
  @Input() showSaveBtn    : boolean = true;
  @Input() showCancelBtn  : boolean = true;
  editData: any;
  isModalOpen : boolean = false;

  @Input() set modalDet(value: any) {   
  
    this.editData = value
  }

  get modalDet() { return this.editData }

  @Input() set modalStatus(value: boolean) {

    this.isModalOpen = value;

    if(this.modalStatus) {

      this.open();

    }

  }

  get modalStatus() { return this.isModalOpen }

  @Output() onClose: EventEmitter<any> = new EventEmitter();

  @ViewChild('modal') private modalContent!: TemplateRef<SuccessModalComponent>;

  constructor(private modalService: NgbModal, private activeModal: NgbActiveModal) { }

  ngOnInit(): void { }

  open() {

    this.activeModal = this.modalService.open(
      this.modalContent,
      {
        "windowClass":"common-modal "+this.className,
        "animation":true,
        "keyboard": false,
        "backdrop":this.backdrop,
        "centered":this.centered,
        "size":this.size
      }
    );
        
  }

  close() {

    this.onClose.emit();

    this.activeModal.close();

  }

}
