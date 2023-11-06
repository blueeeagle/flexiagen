import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  registerForm!: FormGroup;
  formSubmitted = false;
  countryList: Array<any> = [];

  countryDetailsList: Array<any> = [
    {
      "English short name": "Qatar",
      "Alpha-2 code": "QA",
      "Alpha-3 code": "QAT",
      "Numeric code": 634,
      "ISO 3166-2 Code": "QA",
      "Independent": "Yes"
    },
    {
      "English short name": "Saudi Arabia",
      "Alpha-2 code": "SA",
      "Alpha-3 code": "SAU",
      "Numeric code": 682,
      "ISO 3166-2 Code": "SA",
      "Independent": "Yes"
    },
    {
      "English short name": "United Arab Emirates",
      "Alpha-2 code": "AE",
      "Alpha-3 code": "ARE",
      "Numeric code": 784,
      "ISO 3166-2 Code": "AE",
      "Independent": "Yes"
    },
    {
      "English short name": "Kuwait",
      "Alpha-2 code": "KW",
      "Alpha-3 code": "KWT",
      "Numeric code": 414,
      "ISO 3166-2 Code": "KW",
      "Independent": "Yes"
    },
    {
      "English short name": "Bahrain",
      "Alpha-2 code": "BH",
      "Alpha-3 code": "BHR",
      "Numeric code": 48,
      "ISO 3166-2 Code": "BH",
      "Independent": "Yes"
    },
    {
      "English short name": "India",
      "Alpha-2 code": "IN",
      "Alpha-3 code": "IND",
      "Numeric code": 356,
      "ISO 3166-2 Code": "IN",
      "Independent": "Yes"
    },
    {
      "English short name": "Russia",
      "Alpha-2 code": "RU",
      "Alpha-3 code": "RUS",
      "Numeric code": 643,
      "ISO 3166-2 Code": "RU",
      "Independent": "Yes"
    },                  
  ];

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

        this.countryList = [];

        _.map(res.data, (countryDet: any) => {

          let countryDetails = _.find(this.countryDetailsList, { 'Alpha-3 code': countryDet.isoCode });

          if(_.isEmpty(countryDetails) || _.find(this.countryList, { 'Alpha-3 code': countryDet.isoCode })) return;

          this.countryList.push({ ...countryDet, "ISO3666Code": countryDetails["Alpha-2 code"] });

        });

      }

    });

  }

  // Initiate Register form

  loadForm() {

    this.formSubmitted = false;

    this.registerForm = this.service.fb.group({

      'email': ['', [Validators.required, Validators.email]],

      'dialingCode': [null, [Validators.required]],

      'mobile': ['', [Validators.required]],

      'pos': ['', [Validators.required]],

      'online': ['', [Validators.required]],

      'password': ['',[Validators.required]],

      'confirmPassword': ['',[Validators.required]],

      'mLogistic': ['',[Validators.required]],

    });

  }

  // convenience getter for easy access to form fields

  get f(): any { return this.registerForm.controls }

  // Register user

  submit(): any {
    
    if(this.registerForm.invalid) return this.formSubmitted = true;

    this.service.postService({ "url": "/users/register", 'payload': this.registerForm.value, 'options': { 'Content-Type': 'application/x-www-form-urlencoded' } }).subscribe((res: any) => {

      if(res.status==200) {

        this.service.session({ "method": "set", "key": "AuthToken", "value": res.data.accessToken });

        this.service.showToastr({ "data": { "message": "Account Created Successfully", "type": "success" } });

        this.service.navigate({ "url": '/auth/company-details' });

      }

    });

  }

}
