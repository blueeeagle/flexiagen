import { Component } from "@angular/core";
import { FormGroup, Validators } from "@angular/forms";
import { CommonService } from "@shared/services/common/common.service";
import * as _ from "lodash";
@Component({
  selector: 'app-company-details',
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.scss']
})
export class CompanyDetailsComponent {

  companyDetailsFrom: FormGroup = new FormGroup({});
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

  // Load Form

  loadForm() {

    this.companyDetailsFrom = this.service.fb.group({

      'companyName': [ this.service.userDetails?.companyName || '', Validators.required ],

      'ownerName': [ this.service.userDetails?.ownerName || '', Validators.required ],

      'haveTax': [ this.service.userDetails?.haveTax || false, Validators.required ],

      'taxationNumber': [ this.service.userDetails?.taxationNumber || '', Validators.required ],

      'companyLogo': [ this.service.userDetails?.companyLogo ],

    });

    this.f.haveTax?.valueChanges.subscribe((value: boolean) => {

      this.f.taxationNumber.setValue(value ? this.service.userDetails?.taxationNumber : '');

      if(value) this.f.taxationNumber.setValidators([Validators.required]);

      else this.f.taxationNumber.clearValidators();

      this.f.taxationNumber.updateValueAndValidity();

    });

  }

  // convenience getter for easy access to form fields

  get f(): any { return this.companyDetailsFrom.controls; }

  // Submit Form

  submit() {

    this.formSubmitted = true;

    if(this.companyDetailsFrom.invalid) return;

    let payload = _.omit(this.companyDetailsFrom.value,['companyLogo']);

    this.isLoading = true;

    this.service.postService({ "url": `/users/update/${this.service.userDetails._id}`, 'payload': payload }).subscribe((res: any) => {

      if(res.status=='ok') {

        this.service.showToastr({ "data": { "message": "Company details updated successfully", "type": "success" } });

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
