import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-company-details',
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.scss']
})
export class CompanyDetailsComponent {

  companyForm!: FormGroup;
  formSubmitted = false;
  masterList: any = {
    
    countryList: [],

    cityList: [],

    areaList: []

  };
  showPreview: boolean = false;

  constructor(private service: CommonService) { }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    
    this.loadForm();

    this.getCountries();

  }

  getCountries() {

    this.service.getService({ "url": "/master/countries" }).subscribe((res: any) => {

      if(res.status==200) {

        this.masterList['countryList'] = res.data

      }

    });

  }

  // Initiate Company Details form

  loadForm() {

    this.formSubmitted = false;

    this.companyForm = this.service.fb.group({

      'companyName': ['', [Validators.required]],

      'ownerName': ['', [Validators.required]],

      'address': ['', [Validators.required]],

      'area': [null, [Validators.required]],   
      
      'city': [null, [Validators.required]],      

      'country': [null, [Validators.required]],

      'zipCode': ['', [Validators.required]],

    });

  }

  // convenience getter for easy access to form fields

  get f(): any { return this.companyForm.controls }

  // Register Company Details

  submit(): any {
    
    if(this.companyForm.invalid) return this.formSubmitted = true;

    this.service.postService({ "url": "/users/register", 'payload': this.companyForm.value, 'options': { 'Content-Type': 'application/x-www-form-urlencoded' } }).subscribe((res: any) => {

      if(res.status==200) {

        this.service.showToastr({ "data": { "message": "Company Details Created Successfully", "type": "success" } });

      }

    });

  }


  showCompanyDetails(): any {

    if(this.companyForm.invalid) return this.formSubmitted = true;

    this.showPreview = true;

  }

}
