import { Component } from "@angular/core";
import { FormGroup, Validators } from "@angular/forms";
import { CommonService } from "@shared/services/common/common.service";
@Component({
  selector: 'app-company-details',
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.scss']
})
export class CompanyDetailsComponent {

  companyDetailsFrom: FormGroup = new FormGroup({});
  editData: any = {};
  formSubmitted: boolean = false;
  isLoading: boolean = false;

	constructor(private service: CommonService) {}

	ngOnInit() {

    this.loadForm();
	
	}

  // Load Form

  loadForm() {

    this.companyDetailsFrom = this.service.fb.group({

      'companyName': [ this.editData?.companyName || '', Validators.required ],

      'ownerName': [ this.editData?.ownerName || '', Validators.required ],

      'haveTax': [ this.editData?.haveTax || false, Validators.required ],

      'taxationNumber': [ this.editData?.taxationNumber || '', Validators.required ],

      'companyLogo': [ this.editData?.companyLogo || '', Validators.required ],

    });

  }

  // convenience getter for easy access to form fields

  get f(): any { return this.companyDetailsFrom.controls; }

  // Submit Form

  submit() {

    this.formSubmitted = true;

    if(this.companyDetailsFrom.invalid) return;

    let payload = this.companyDetailsFrom.value;

    this.isLoading = true;

    console.log(payload);

  }

}
