import { Component, Inject, OnInit } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA} from '@angular/material/snack-bar';

@Component({
  selector: 'app-common-toastr',
  templateUrl: './common-toastr.component.html',
  styleUrls: ['./common-toastr.component.scss']
})
export class CommonToastrComponent implements OnInit {

  constructor
  (
    public sbRef: MatSnackBarRef<CommonToastrComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any
  ) 
  {}

  ngOnInit(): void {
  }

   getIcon(): any{
    switch (this.data.type) {
      case 'success':
        return { parent: "success", child :'bx bx-check-circle fs-3' };
      case 'error':
        return { parent: "error", child :'bx bx-error-circle fs-3' };
      case 'warn':
        return { parent: "warn", child :'bx bx-error fs-3' };
      case 'info':
        return { parent: "info", child :'bx bx-info-circle fs-3' };
    }
  }
}
