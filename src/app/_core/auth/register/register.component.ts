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
  formSubmitted: boolean = false;
  isLoading: boolean = false;
  countryList: Array<any> = [];

  countryDetailsList: Array<any> = [
    {
      "English short name": "Qatar",
      "ISO3666Code": "QA",
      "Alpha-3 code": "QAT",
      "Numeric code": 634,
      "ISO 3166-2 Code": "QA",
      "Independent": "Yes"
    },
    {
      "English short name": "Saudi Arabia",
      "ISO3666Code": "SA",
      "Alpha-3 code": "SAU",
      "Numeric code": 682,
      "ISO 3166-2 Code": "SA",
      "Independent": "Yes"
    },
    {
      "English short name": "United Arab Emirates",
      "ISO3666Code": "AE",
      "Alpha-3 code": "ARE",
      "Numeric code": 784,
      "ISO 3166-2 Code": "AE",
      "Independent": "Yes"
    },
    {
      "English short name": "Kuwait",
      "ISO3666Code": "KW",
      "Alpha-3 code": "KWT",
      "Numeric code": 414,
      "ISO 3166-2 Code": "KW",
      "Independent": "Yes"
    },
    {
      "English short name": "Bahrain",
      "ISO3666Code": "BH",
      "Alpha-3 code": "BHR",
      "Numeric code": 48,
      "ISO 3166-2 Code": "BH",
      "Independent": "Yes"
    },
    {
      "English short name": "India",
      "ISO3666Code": "IN",
      "Alpha-3 code": "IND",
      "Numeric code": 356,
      "ISO 3166-2 Code": "IN",
      "Independent": "Yes"
    },
    {
      "English short name": "Russia",
      "ISO3666Code": "RU",
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

          this.countryList.push({ ...countryDet, "ISO3666Code": countryDetails["ISO3666Code"] });

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

      'pos': false,

      'online': false,

      'password': ['',[Validators.required]],

      'confirmPassword': ['',[Validators.required]],

      'mLogistic': false,

    },{

      validator: this.service.matchValidator('password', 'confirmPassword')

    });

  }

  // convenience getter for easy access to form fields

  get f(): any { return this.registerForm.controls }

  // Register user

  submit(): any {

    if(this.registerForm.invalid) return this.formSubmitted = true;

    let payload: any = _.omit(this.registerForm.value,['confirmPassword']);

    if(!payload.pos && !payload.online) return this.service.showToastr({ "data": { "message": "Please select atleast one service", "type": "error" } });

    this.isLoading = true;

    this.service.postService({ "url": "/users/register", 'payload': this.registerForm.value, 'options': { 'Content-Type': 'application/x-www-form-urlencoded' } }).subscribe((res: any) => {

      if(res.status==201) {

        this.isLoading = false;

        this.service.session({ "method": "set", "key": "AuthToken", "value": res.data.accessToken });

        this.service.showToastr({ "data": { "message": "Account Created Successfully", "type": "success" } });

        this.service.navigate({ "url": '/auth/company-details' });

      } else this.isLoading = false;

    },(err: any)=>{

      if(err.status == 409) {
        
        this.service.navigate({ "url": '/auth/login' });

        this.service.showToastr({ "data": { "type": "info", "message": "You have already registered!" } });

      } else this.service.showToastr({ "data": { "message": _.get(err, 'error.message', 'Something went wrong'), "type": "error" } });

      this.isLoading = false;

    });

  }

}
