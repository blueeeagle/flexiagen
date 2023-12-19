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
  userSubscribe: any;

	constructor(public service: CommonService) {
    
    this.loadForm();

    this.userSubscribe = this.service.userDetailsObs.subscribe((value)=>{

      if(!_.isEmpty(value)) this.loadForm();
      
    });

  }

	ngOnInit() {}

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

    let payload: any = _.omit(this.accountDetailsFrom.value,['confirmPassword']);

    this.service.patchService({ "url": "/me/accountDetails", 'payload': payload }).subscribe((res: any) => {

      if(res.status=='ok') {

        this.service.showToastr({ "data": { "message": "Account details updated successfully", "type": "success" } });

        this.isLoading = false;

        this.formSubmitted = false;

        this.service.userDetails = _.omit(res.data,'companyId');

        this.service.companyDetails = _.get(res.data,'companyId');

        this.service.userDetailsObs.next(this.service.userDetails);

      }

    });

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.userSubscribe.unsubscribe();
  }

}
