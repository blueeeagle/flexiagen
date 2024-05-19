import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {

  email: string = "";
  otpSent: boolean = false;
  otp: string = "";
  formSubmitted = false;
  _: any = _;
  seconds: number = 60;
  otpVerified: boolean = false;
  isLoading: boolean = false;
  passwordForm: FormGroup = new FormGroup({});

  constructor(private service: CommonService) { 
    this.loadForm();
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    
  }

  loadForm(): any {

    this.passwordForm = this.service.fb.group({

      'password': [ '', [Validators.required,Validators.minLength(8)] ],

      'confirmPassword': [ '', Validators.required ],

    },{

      validators: [ this.service.matchValidator('password', 'confirmPassword') ]

    });

  }

  get f(): any { return this.passwordForm.controls; }
  
  startTimer() {

    this.seconds = 60;

    const timeInterval = setInterval(() => {

      this.seconds--;

      if(this.seconds == 0) clearInterval(timeInterval);

    }, 1000);

  }

  sendOTP(): any {

    if(_.isEmpty(this.email)) return this.formSubmitted = true;

    this.isLoading = true;

    this.service.postService({ "url": "/forgetPwd/sendOTP", 'payload': { "email": this.email } }).subscribe((res: any) => {

      if(res.status=='ok') {

        this.otpSent = true;

        this.service.showToastr({ "data": { "message": "OTP sent successfully", "type": "success" } });

        this.startTimer();

      }

      this.isLoading = false;

    },(err: any) => {
    
      this.isLoading = false;

      this.service.showToastr({ "data": { "message": err.error.message, "type": "error" } });
      
    });

  }

  // Login user

  verifyOTP(): any {
    
    if(_.size(this.otp) < 4) return this.formSubmitted = true;

    this.isLoading = true;

    this.service.postService({ "url": "/forgetPwd/validateOTP", 'payload': { "email": this.email, "otp": this.otp } }).subscribe((res: any) => {

      if(res.status=='ok') {

        this.service.showToastr({ "data": { "message": "OTP Verified Successfully", "type": "success" } });

        this.loadForm();

        this.otpVerified = true;

        this.formSubmitted = false;
        
      }
      
      this.isLoading = false;

    },(err: any) => { 

      this.service.showToastr({ "data": { "message": err.error.message, "type": "error" } });
      
      this.isLoading = false;

    });

  }

  changePassword(): any {

    this.formSubmitted = true;

    if(this.passwordForm.invalid) return;

    this.isLoading = true;

    this.service.postService({ "url": "/forgetPwd/changePassword", 'payload': { "email": this.email, "password": this.passwordForm.value.password } }).subscribe((res: any) => {

      if(res.status=='ok') {

        this.service.showToastr({ "data": { "message": "Password changed successfully", "type": "success" } });

        this.service.navigate({ "url": "/auth/login" });

        this.isLoading = false;

        this.formSubmitted = false;

      }

    },(err: any) => {
    
      this.isLoading = false;

      this.service.showToastr({ "data": { "message": err.error.message, "type": "error" } });
      
    });

  }

}
