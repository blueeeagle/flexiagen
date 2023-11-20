import { ChangeDetectorRef, Component, ViewChild } from "@angular/core";
import { FormGroup, Validators } from "@angular/forms";
import { NgbAlert } from "@ng-bootstrap/ng-bootstrap";
import { CommonService } from "@shared/services/common/common.service";
import * as _ from "lodash";

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
  isLoading: boolean = false;

	constructor(private service: CommonService, private cdr: ChangeDetectorRef,) {}

	ngOnInit() {

    this.loadForm();
	
	}

  loadForm() {

    this.accountDetailsFrom = this.service.fb.group({

      'mobileNo': [ this.editData?.mobileNo || '', Validators.required ],

      'emailId': [ this.editData?.emailId || '', Validators.required ],

      'newPassword': [ '', Validators.required ],

      'confirmPassword': [ '', Validators.required ],

    });

  }

  get f(): any { return this.accountDetailsFrom.controls; }

  submitForm() {

    this.formSubmitted = true;

    if(this.accountDetailsFrom.invalid) return;

    this.isLoading = true;

    let payload: any = _.pick(this.accountDetailsFrom.value,['newPassword','confirmPassword']);

    payload['password'] = payload['newPassword'];

    setTimeout(()=>{

      this.isLoading = false;

    },100)

    // this.service.postService({ "url": "/users/update/"+this.service.userDetails.id, 'payload': payload }).subscribe((res: any) => {



    // });

  }

}
