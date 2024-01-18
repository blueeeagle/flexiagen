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
  userSubscribe: any;
  _: any = _;

	constructor(public service: CommonService) {

    this.userSubscribe = this.service.userDetailsObs.subscribe((value)=>{

      if(!_.isEmpty(value)) this.loadForm();
      
    })

  }

	ngOnInit() {

    this.loadForm();
	
	}

  // Load Form

  loadForm() {

    this.companyDetailsFrom = this.service.fb.group({

      'companyName': [ this.service.companyDetails?.companyName || '', Validators.required ],

      'ownerName': [ this.service.companyDetails?.ownerName || '', Validators.required ],

      'haveTax': [ this.service.companyDetails?.haveTax || false ],

      'taxationNumber': [ 
        
        { 'value': this.service.companyDetails?.taxationNumber || '', disabled: !this.service.companyDetails?.haveTax },
        
        this.service.companyDetails?.haveTax ? [Validators.required] : [] 
      
      ],

      'companyLogo': [ this.service.companyDetails?.companyLogo ],

    });

    this.f.haveTax?.valueChanges.subscribe((value: boolean) => {

      this.f.taxationNumber.enable();

      this.f.taxationNumber.setValue(value ? this.service.userDetails?.taxationNumber : '');

      if(value) this.f.taxationNumber.setValidators([Validators.required]);

      else {
        
        this.f.taxationNumber.clearValidators();

        this.f.taxationNumber.disable();

      }

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

    this.service.patchService({ "url": `/setup/company/details/${this.service.companyDetails._id}`, 'payload': payload }).subscribe((res: any) => {

      if(res.status=='ok') {

        this.service.showToastr({ "data": { "message": "Company details updated successfully", "type": "success" } });

        this.isLoading = false;

        this.formSubmitted = false;

        this.service.companyDetails = _.omit(res.data,'agentId');

        this.service.userDetails = _.get(res.data,'agentId');

        this.service.userDetailsObs.next(res.data);

      }

    },(err: any) => {

      this.isLoading = false;
      
      this.service.showToastr({ "data": { "message": err?.error?.message || "Something went wrong", "type": "error" } });

    });

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.userSubscribe.unsubscribe();
  }  

}
