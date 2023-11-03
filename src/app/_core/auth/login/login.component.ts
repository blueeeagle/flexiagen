import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { CommonService } from '@shared/services/common/common.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  loginForm!: FormGroup;
  formSubmitted = false;

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

}
