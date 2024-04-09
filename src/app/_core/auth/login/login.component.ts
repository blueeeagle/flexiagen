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

    this.service.postService({ "url": "/login", 'payload': this.loginForm.value, 'options': { 'Content-Type': 'application/x-www-form-urlencoded' } }).subscribe((res: any) => {

      if(res.status=='ok') {

        this.service.session({ "method": "set", "key": "AuthToken", "value": res.data.token });
        
        this.service.userDetails = res.data.userDetails;
        
        this.service.session({ "method": "set", "key": "UserDetails", "value": JSON.stringify(this.service.userDetails) });

        this.isLoading = false;

        if(_.isEmpty(res.data.companyDetails)) { // Check the user already created company details

          this.service.navigate({ 'url': '/auth/company-details/new' });

          this.service.showToastr({ "data": { "message": "Please complete your company details", "type": "info" } });

        } else if(res.data.userDetails.pos && false)  { // Check for payment status

          this.service.navigate({ 'url': '/auth/payment' });

          this.service.showToastr({ "data": { "message": "Please complete your payment", "type": "info" } });

        } else {

          this.service.companyDetails = res.data.companyDetails;

          this.service.currencyDetails = this.service.companyDetails.currencyId;

          let permissions: any = {};

          let menuList: Array<any> = [];

          for(let menuDet of res.data.roleDetails?.permissions || this.service.menuList) {

            if(!this.service.companyDetails?.agentId?.pos && menuDet.label == 'Create Order') continue;

            let menu: any = _.pick(menuDet, ['label', 'url', 'icon']);

            menu['subMenu'] = [];

            permissions[menuDet.label] = {
              
              'permission': menuDet.permissions || _.isEmpty(res.data.roleDetails) ? [ "view","create","edit", "delete" ] : [],

              'subMenu': {}

            }

            for(let subMenuOneDet of menuDet?.subMenu || []) {

              let subMenuOne: any = _.pick(subMenuOneDet, ['label', 'url', 'icon']);

              subMenuOne['subMenu'] = [];

              permissions[menuDet.label]['subMenu'][subMenuOneDet.label] = {
                
                'permission': subMenuOneDet.permissions || _.isEmpty(res.data.roleDetails) ? [ "view","create","edit", "delete" ] : [],

                'subMenu': {}
              
              };

              for(let subMenuTwoDet of subMenuOneDet?.subMenu || []) {

                let subMenuTwo: any = _.pick(subMenuTwoDet, ['label', 'url', 'icon']);

                subMenuOne['subMenu'].push(subMenuTwo);

                permissions[menuDet.label]['subMenu'][subMenuOneDet.label]['subMenu'][subMenuTwoDet.label] = {
                  
                  'permission': subMenuTwoDet.permissions || _.isEmpty(res.data.roleDetails) ? [ "view","create","edit", "delete" ] : []
                
                }

              }

              menu['subMenu'].push(subMenuOne);

            }

            menuList.push(menu);

          }

          this.service.session({ "method": "set", "key": "Permissions", "value": JSON.stringify(permissions) });

          this.service.session({ "method": "set", "key": "MenuList", "value": JSON.stringify(menuList) });

          this.service.session({ "method": "set", "key": "CompanyDetails", "value": JSON.stringify(_.omit(this.service.companyDetails,'currencyId')) });

          this.service.session({ "method": "set", "key": "CurrencyDetails", "value": JSON.stringify(this.service.currencyDetails) });

          this.service.showToastr({ "data": { "message": "Logged in successfully", "type": "success" } });

          this.service.navigate({ 'url': '/pages/dashboard' });

        }

      } else this.isLoading = false;

    },(err: any)=>{

      this.service.showToastr({ "data": { "message": err.error.message || "Internal Server", "type": "error" } }); 

      this.isLoading = false;

    });

  }

}
