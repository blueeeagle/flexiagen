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
  userProfile: any = '';
  profileImg: any = '';


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

      'password': [ '', [Validators.minLength(8)] ],  //[Validators.required,] 

      'confirmPassword': [''],

      'profileImg': [this.service.userDetails?.profileImg ? this.service.getFullImagePath({ 'imgUrl': this.service.userDetails.profileImg}) : '' ],

    },{

      validators: [ this.service.matchValidator('password', 'confirmPassword') ]

    });

    this.accountDetailsFrom.get('password')?.valueChanges.subscribe((value)=>{

      if(value) this.accountDetailsFrom.get('confirmPassword')?.setValidators([Validators.required]);

      else this.accountDetailsFrom.get('confirmPassword')?.clearValidators();

      this.accountDetailsFrom.get('confirmPassword')?.updateValueAndValidity();

    });

  }

  get f(): any { return this.accountDetailsFrom.controls; }

  uploadFile(event:any) {

    const file = event.target?.files[0]; // Here we use only the first file (single file)

    if(file) {

      const reader = new FileReader();

      // validate file type & size

      const validFileExtensions = ['image/jpeg','image/jpg','image/png'];

      if(!validFileExtensions.includes(file.type)) return this.service.showToastr({ data: { type: "error", message: "Invalid file type" } });

      if(file.size > 1048576) return this.service.showToastr({ data: { type: "error", message: "File size should not exceed 1MB" } });

      // check dimensions of image

      // const img = new Image();

      // img.src = window.URL.createObjectURL(file);

      // img.onload = () => {

      //   if(img.width != 150 || img.height != 150) return this.service.showToastr({ data: { type: "error", message: "Image should be 150px X 150px" } });

      //   else {

          // File Preview
      
          reader.onload = () => {

            this.accountDetailsFrom.patchValue({ "profileImg": reader.result as string });

            this.profileImg = file;

          }

          reader.readAsDataURL(file);

      //   }

      // }

    }

  }
  submit() {

    this.formSubmitted = true;

    if(this.accountDetailsFrom.invalid) return;

    this.isLoading = true;

    const payload = _.omit(this.accountDetailsFrom.getRawValue(),'confirmPassword','profileImg')

    const formData = new FormData();

    formData.append("data", JSON.stringify(payload));

    if(this.profileImg) formData.append("profileImg", this.profileImg);    

    this.service.patchService({ "url": "/me/accountDetails", 'payload': formData }).subscribe((res: any) => {

      if(res.status=='ok') {

        this.service.showToastr({ "data": { "message": "Account details updated successfully", "type": "success" } });

        this.isLoading = false;

        this.formSubmitted = false;

        this.service.userDetails = _.omit(res.data,'companyId');

        this.service.companyDetails = _.get(res.data,'companyId');

        this.service.session({ "method": "set", "key": "UserDetails", "value": JSON.stringify(this.service.userDetails) });

        this.service.session({ "method": "set", "key": "CompanyDetails", "value": JSON.stringify(this.service.companyDetails) });

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
