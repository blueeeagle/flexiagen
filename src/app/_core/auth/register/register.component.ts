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
  dialCodeList: Array<any> = [];
  _: any = _;

  constructor(private service: CommonService) { }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    
    this.loadForm();

    this.getCountries();

  }

  getCountries() {

    this.service.getService({ "url": "/address/dialCode" }).subscribe((res: any) => {

      this.dialCodeList = res.status=='ok' ? res.data : [];

    });

  }

  // Initiate Register form

  loadForm() {

    this.formSubmitted = false;

    this.registerForm = this.service.fb.group({

      'name': ['', [Validators.required]],

      'email': ['', [Validators.required, Validators.email]],

      'dialCode': [null, [Validators.required]],

      'mobile': ['', [Validators.required]],

      'pos': false,

      'online': false,

      'password': ['',[Validators.required,Validators.minLength(8)]],

      'confirmPassword': ['',[Validators.required]],

      'logistics': { value: false, disabled: true},

      'userType': 'agent'

    },{

      validator: this.service.matchValidator('password', 'confirmPassword')

    });

    this.registerForm.get('online')?.valueChanges.subscribe((value: any) => {

      if(value) this.registerForm.get('logistics')?.enable();

      else this.f.logistics.disable();

      this.f.logistics.setValue(value);

      this.f.logistics.updateValueAndValidity();

    });

  }

  // convenience getter for easy access to form fields

  get f(): any { return this.registerForm.controls }

  // Register user

  submit(): any {

    if(this.registerForm.invalid) return this.formSubmitted = true;

    let payload: any = _.omit(this.registerForm.getRawValue(),['confirmPassword']);

    if(!payload.pos && !payload.online) return this.service.showToastr({ "data": { "message": "Please select atleast one service", "type": "error" } });

    this.isLoading = true;

    this.service.postService({ "url": "/register", 'payload': payload }).subscribe((res: any) => {

      if(res.status=='ok') {

        this.isLoading = false;

        this.service.session({ "method": "set", "key": "AuthToken", "value": res.data.token });

        this.service.session({ "method": "set", "key": "UserDetails", "value": JSON.stringify(res.data.userDetails) });

        this.service.userDetails = res.data.userDetails;

        this.service.showToastr({ "data": { "message": "Account Created Successfully", "type": "success" } });

        this.service.navigate({ "url": '/auth/company-details' });

      } else this.isLoading = false;

    },(err: any)=>{

      if(err.status == 403) {
        
        this.service.navigate({ "url": '/auth/login' });

        this.service.showToastr({ "data": { "type": "info", "message": "You have already registered!" } });

      } else this.service.showToastr({ "data": { "message": _.get(err, 'error.message', 'Something went wrong'), "type": "error" } });

      this.isLoading = false;

    });

  }

}
