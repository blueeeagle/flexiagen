import { ChangeDetectorRef, Component, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbAlert } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.scss']
})
export class AccountDetailsComponent {

  accountDetailsFrom: FormGroup = new FormGroup({});
  editData: any = {};
  formSubmitted: boolean = false;

	// @ViewChild('staticAlert', { static: false }) staticAlert: NgbAlert;
	@ViewChild('selfClosingAlert', { static: false }) selfClosingAlert!: NgbAlert;

	constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef,) {}

	ngOnInit() {

    this.loadForm();
	
	}

  loadForm() {

    this.accountDetailsFrom = this.fb.group({

      'mobileNo': [ this.editData?.accountName || '', Validators.required ],

      'emailId': [ this.editData?.emailId || '', Validators.required ],

      'newPassword': [ this.editData?.newPassword || '', Validators.required ],

      'conformPassword': [ this.editData?.conformPassword || '', Validators.required ],

    });

  }

  get f(): any { return this.accountDetailsFrom.controls; }

}
