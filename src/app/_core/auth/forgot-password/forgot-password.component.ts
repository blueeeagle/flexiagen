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

  otp: Array<any> = ["", "", "", ""];
  formSubmitted = false;
  _: any = _;
  seconds: number = 60;
  otpVerified: boolean = false;
  isLoading: boolean = false;

  constructor(private service: CommonService) { 

    this.startTimer();

  }

  startTimer() {

    const timeInterval = setInterval(() => {

      this.seconds--;

      if(this.seconds == 0) clearInterval(timeInterval);

    }, 1000);

  }

  resendOTP() {

    setTimeout(()=>{

      this.service.showToastr({ "data": { "message": "OTP sent successfully", "type": "success" } })

      this.seconds = 60;

    },1000);

    this.startTimer();

    // this.service.postService({ "url": "/users/resendOtp", 'payload': { "email": this.service.session({ "method": "get", "key": "email" }) }, 'options': { 'Content-Type': 'application/x-www-form-urlencoded' } }).subscribe((res: any) => {

    //   if(res.status==200) {

    //     this.service.showToastr({ "data": { "message": "OTP sent successfully", "type": "success" } });

    //     this.seconds = 60;

    //     this.startTimer();

    //   }

    // });

  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    
  }

  // Login user

  verifyOTP(): any {
    
    if(_.size(_.pickBy(this.otp)) < 4) return this.formSubmitted = true;

    this.isLoading = true;

    this.service.showToastr({ "data": { "message": "OTP Verified Successfully", "type": "success" } });

    this.otpVerified = true;

    // this.service.postService({ "url": "/users/verifyOtp", 'payload': _.join(this.otp), 'options': { 'Content-Type': 'application/x-www-form-urlencoded' } }).subscribe((res: any) => {

    //   if(res.status==200) {

    //     this.service.showToastr({ "data": { "message": "OTP Verified Successfully", "type": "success" } });

    //     this.otpVerified = true;

    //     this.isLoading = false;

    //   }

    // });

  }

}
