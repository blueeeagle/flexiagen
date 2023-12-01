import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationDialogService } from '@shared/components/confirmation-dialog/confirmation.service';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent {


  openCanvas: boolean = false;
  formSubmitted: boolean = false;
  countryList: Array<any> = [];
  masterList : any = {};
  addUserForm: FormGroup = new FormGroup({});

  constructor(public service: CommonService, private fb: FormBuilder,private confirmationDialog: ConfirmationDialogService){}
  
  @Input() editData: any = {};

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

  ngOnInit() {

    this.loadForm();

    this.getCountries()
	
	}

  getCountries() {

    this.service.getService({ "url": "/master/countries" }).subscribe((res: any) => {

      if(res.status=='ok') {

        this.countryList = [];

        _.map(res.data, (countryDet: any) => {

          let countryDetails = _.find(this.countryDetailsList, { 'Alpha-3 code': countryDet.isoCode });

          if(_.isEmpty(countryDetails) || _.find(this.countryList, { 'Alpha-3 code': countryDet.isoCode })) return;

          this.countryList.push({ ...countryDet, "ISO3666Code": countryDetails["ISO3666Code"] });

        });

      }

    });

  }

  // Load Form

  loadForm() {

    this.addUserForm = this.service.fb.group({

      'name': [ this.editData?.name || '', Validators.required ],

      'email': [ this.editData?.email || '', Validators.required ],

      'userName': [ this.editData?.userName || '', Validators.required ],

      'dialCode': [this.editData?.dialCode || null, [Validators.required]],

      'mobile': [this.editData?.mobile || '', [Validators.required]],
      
      'role': [this.editData?.role || null, [Validators.required]],

      'isActive': [this.editData?.isActive || null, [Validators.required]],

      'profile': [this.editData?.profile || null, [Validators.required]],

    });

  }

  // convenience getter for easy access to form fields

  get f(): any { return this.addUserForm.controls; }

}
