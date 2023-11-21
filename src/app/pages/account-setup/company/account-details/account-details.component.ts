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
  formSubmitted: boolean = false;
  isLoading: boolean = false;

	constructor(private service: CommonService) {

    this.service.userDetailsObs.subscribe((value)=>{

      if(!_.isEmpty(value)) this.loadForm();
      
    })

  }

	ngOnInit() {

    this.loadForm();
	
	}

  loadForm() {

    this.accountDetailsFrom = this.service.fb.group({

      'mobile': [ this.service.userDetails?.mobile || '', Validators.required ],

      'email': [ this.service.userDetails?.email || '', [Validators.required, Validators.email] ],

      'password': [ '', Validators.required ],

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

    this.service.postService({ "url": `/users/update/${this.service.userDetails.id}`, 'payload': payload }).subscribe((res: any) => {

      if(res.status == 200) {

        this.service.showToastr({ "data": { "message": "Account details updated successfully", "type": "success" } });

        this.isLoading = false;

        this.formSubmitted = false;

        this.service.getUserDetails.subscribe((userRes: any) => {

          this.service.userDetails = userRes.data;

          this.service.userDetailsObs.next(userRes.data);

        });

      }

    });

  }

}
