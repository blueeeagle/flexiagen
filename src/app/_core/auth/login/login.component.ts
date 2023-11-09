import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  loginForm!: FormGroup;
  formSubmitted: boolean = false;
  isLoading: boolean = false;

  constructor(private service: CommonService) { }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    
    this.loadForm();

  }

  // Initiate login form

  loadForm() {

    this.formSubmitted = false;

    this.loginForm = this.service.fb.group({

      'email': ['', [Validators.required, Validators.email]],

      'password': ['',[Validators.required]]

    });

  }

  // convenience getter for easy access to form fields

  get f(): any { return this.loginForm.controls }

  // Login user

  login(): any {
    
    if(this.loginForm.invalid) return this.formSubmitted = true;

    this.isLoading = true;

    this.service.postService({ "url": "/users/login", 'payload': this.loginForm.value, 'options': { 'Content-Type': 'application/x-www-form-urlencoded' } }).subscribe((res: any) => {

      if(res.status==200) {

        this.service.session({ "method": "set", "key": "AuthToken", "value": res.data.accessToken });

        this.service.getUserDetails().subscribe((res: any) => {

          if(res.status == 200) {

            this.isLoading = false;

            this.service.userDetails = res.data;

            if(_.isEmpty(this.service.userDetails.companyName)) { // Check the user already created company details

              this.service.navigate({ 'url': '/auth/company-details' });

              this.service.showToastr({ "data": { "message": "Please complete your company details", "type": "info" } });

            } else if(this.service.userDetails.pos && false)  { // Check for payment status

              this.service.navigate({ 'url': '/auth/payment' });

              this.service.showToastr({ "data": { "message": "Please complete your payment", "type": "info" } });

            } else {

              this.service.session({ "method": "set", "key": "CompanyStatus", "value": "Created" });

              this.service.showToastr({ "data": { "message": "Logged in successfully", "type": "success" } });

              this.service.navigate({ 'url': '/pages/dashboard' });

            }

          }

        });

      }

    },(err: any)=>{

      this.isLoading = false;

    });

  }

}
