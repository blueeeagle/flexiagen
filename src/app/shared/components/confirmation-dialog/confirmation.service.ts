import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { confirmationDialogData } from './confirmationModalData.interface';

@Injectable()
export class ConfirmationDialogService {

  constructor(private modalService: NgbModal) { }

  public confirm(data : confirmationDialogData): Promise<boolean> {
    
    const modalRef = this.modalService.open(ConfirmationDialogComponent, { windowClass :"d-flex modal-dialog-centered confirmationModal justify-content-around flex-column" , backdrop: "static", keyboard : false, });

    modalRef.componentInstance.iconClass = 
    
      data.type == 'success' ? 

        'bx bx-check-circle fs-3' : 
        
          data.type == 'error' ? 
          
            'bx bx-error-alt fs-3' : 
            
              data.type == 'info' ? 
              
                'bx bx-info-circle fs-3' : 
                
                  data.type == 'warn' ? 
                  
                    'bx bx-error fs-3' :  data.icon?.class;

    modalRef.componentInstance.iconColor = data.type || data.icon?.color;

    modalRef.componentInstance.title = data.title;

    modalRef.componentInstance.message = data.message;

    modalRef.componentInstance.btnOkShow = data.actions?.cancel?.show || true;

    modalRef.componentInstance.btnCancelShow = data.actions?.cancel?.show || true;

    modalRef.componentInstance.btnOkText = data.actions?.confirm?.label || "yes";

    modalRef.componentInstance.btnCancelText = data.actions?.cancel?.label || "no";

  
    return modalRef.result;
  }

}