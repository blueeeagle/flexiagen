import { Component } from "@angular/core";
import { FormGroup, Validators } from "@angular/forms";
import { CommonService } from "@shared/services/common/common.service";
import * as _ from "lodash";

@Component({
  selector: 'app-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.scss']
})
export class AccountDetailsComponent {

  accountDetailsFrom: FormGroup = new FormGroup({});
  formSubmitted: boolean = false;
  isLoading: boolean = false;
  _: any = _;

	constructor(private service: CommonService) {}

	ngOnInit() {

    this.loadForm();
	
	}

  loadForm() {

    this.accountDetailsFrom = this.service.fb.group({

      'mobile': [ this.service.userDetails?.mobile || '', Validators.required ],

      'email': [ this.service.userDetails?.email || '', [Validators.required, Validators.email] ],

      'password': [ '', [Validators.required,Validators.minLength(8)] ],

      'confirmPassword': [ '', Validators.required ],

    },{

      validators: [ this.service.matchValidator('password', 'confirmPassword') ]

    });

  }

  get f(): any { return this.accountDetailsFrom.controls; }

  submit() {

    this.formSubmitted = true;

    if(this.accountDetailsFrom.invalid) return;

    this.isLoading = true;

    let payload: any = _.pick(this.accountDetailsFrom.value,['confirmPassword']);

    this.service.postService({ "url": `/users/update/${this.service.userDetails._id}`, 'payload': payload }).subscribe((res: any) => {

      if(res.status=='ok') {

        this.service.showToastr({ "data": { "message": "Account details updated successfully", "type": "success" } });

        this.isLoading = false;

        this.formSubmitted = false;

        this.service.userDetails = _.omit(res.data,'companyId');

        this.service.companyDetails = res.data.companyId;

        this.service.session({ "method": "set", "key": "CompanyDetails", "value": JSON.stringify(res.data.companyId) });

        this.service.session({ "method": "set", "key": "UserDetails", "value": JSON.stringify(_.omit(res.data,['companyId'])) });



      }

    });

  }

}
