import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent implements OnInit {

  
  @Input() iconClass : string = "bx bx-error fs-3";
  @Input() iconColor : string = "primary";
  @Input() title: string = "";
  @Input() message: string = "";
  @Input() btnOkText: string = "";
  @Input() btnCancelText: string = "";
  @Input() btnOkShow : boolean = true;
  @Input() btnCancelShow : boolean = true;
  
  constructor(private activeModal: NgbActiveModal) { }

  ngOnInit(): void {}

  // if status is cancel
  public decline() {
    this.activeModal.close(false);
  }

  // If status is confirm
  public accept() {
    this.activeModal.close(true);
  }

  // If press esc 
  public dismiss() {
    this.activeModal.dismiss();
  }
}
