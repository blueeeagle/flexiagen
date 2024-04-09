import { Injectable } from '@angular/core';
import { DecimalPipe} from '@angular/common';
import { Router } from '@angular/router';
import { APP_CONFIG } from '@env/environment';
import { ApiService } from '../api/api.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ToastrConfigData } from '@shared/components/common-toastr/toastr-data.interface';
import { CommonToastrComponent } from '@shared/components';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as _ from 'lodash';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LoadingService } from '../loading/loading.service';
import * as moment from 'moment';


@Injectable({
  providedIn: 'root'
})
export class CommonService {

  pageSizeList: any = [10, 25, 50, 100];
  todayDate: Date = moment().toDate();
  public userDetails: any = {};
  public companyDetails: any = {};
  public currencyDetails: any = JSON.parse(this.session({ "method": "get", "key": "CurrencyDetails" })) || {};
  public otherData: any = {
    'orderDetails': {},
    'secondaryPageTitle': ''
  };
  public userDetailsObs = new Subject();

  constructor(private router: Router, public apiservice: ApiService, private snackBar: MatSnackBar, public decimalPipe: DecimalPipe, public fb: FormBuilder, public _loading: LoadingService) {

  }

  updateUserDetails() {

    this.getUserDetails.subscribe((res: any) => {
    
      if(res.status=='ok') {

        this.userDetails = { ..._.omit(res.data,'companyId'), "companyId": res.data.companyId?._id };

        this.companyDetails = res.data.companyId || {};

        this.currencyDetails = this.companyDetails?.currencyId || {};

        this.session({ "method": "set", "key": "UserDetails", "value": JSON.stringify(this.userDetails) });

        this.session({ "method": "set", "key": "CompanyDetails", "value": JSON.stringify(_.omit(this.companyDetails,'currencyId')) });

        this.session({ "method": "set", "key": "CurrencyDetails", "value": JSON.stringify(this.currencyDetails) });

        this.userDetailsObs.next(this.userDetails);

      }

    },(err: any) => { 

      this.userDetails = JSON.parse(this.session({ "method": "get", "key": "UserDetails" }));

      this.companyDetails = JSON.parse(this.session({ "method": "get", "key": "CompanyDetails" }));
  
      this.currencyDetails = JSON.parse(this.session({ "method": "get", "key": "CurrencyDetails" }));      

      this.userDetailsObs.next(this.userDetails);

     });

  }

  get getUserDetails(): any {

    return this.getService({ "url": "/me", "options": { "loaderState": true } });

  }

  getPosition(): Promise<any> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resp => {
        resolve({lng: resp.coords.longitude, lat: resp.coords.latitude});
      },
      err => {
        reject(err);
      });
    });
  }

  // Set/Get/Remove for Session storage

  session({ method = "get", key = "", value = {} } :{ method: "get" | "set" | "remove" | "clear", key?: string, value?: any }): any {

    if(method === "get") {

      let sessionData = sessionStorage.getItem(key);  

      return sessionData ? APP_CONFIG.encryptedReq ? this.apiservice.decryptData(sessionData) : sessionData : null;

    }

    else if(method === "set") {

      APP_CONFIG.encryptedReq ? value = this.apiservice.encryptData(value) : "";

      sessionStorage.setItem(key,value);

    }

    else if(method === "remove") sessionStorage.removeItem(key);

    else if(method === "clear") sessionStorage.clear();

  }  

  setApiLoaders({ isLoading = false, url = [] }: { isLoading: boolean, url: any }) {

    for(let i=0; i<url.length; i++) {

      this._loading.setLoading({ loading: isLoading, url: this.apiservice.baseUrl + url[i] });

    }

  }

  getFullImagePath({ imgUrl = "", baseUrlFrom = 'AGENT_IMG_URL' }: { imgUrl: any, baseUrlFrom?: 'AGENT_IMG_URL' | 'ADMIN_IMG_URL' | 'CUSTOMER_IMG_URL'}): string {
    // Replace backslashes with forward slashes
    const imagePath = (imgUrl || "").replace(/\\/g, '/');
    return (APP_CONFIG[baseUrlFrom] + imagePath).toString();
  }

  getCustomerImgUrl({ event = {}, customerDetail = {} }: { event: any,  customerDetail: any}): string {
    return event.target.src = customerDetail.gender ? './assets/images/'+customerDetail.gender+'-user-profile.png' : './assets/images/male-user-profile.png';
  }

  // POST API Method While Pass JSON Data
  
  postService({ url = "", payload = {}, params = {}, options = {} } : {url: string, payload?: any, params?: any, options?: any }): any {

    if(options.loaderState) this._loading.setLoading({ loading: true, url: this.apiservice.baseUrl + url });

    return this.apiservice.postService({ url, payload, params, options });
    
  }

  // PATCH API Method

  patchService({ url = "", payload = {}, params = {}, options = {} } : {url: string, payload?: any, params?: any, options?: any }): any {

    if(options.loaderState) this._loading.setLoading({ loading: true, url: this.apiservice.baseUrl + url });

    return this.apiservice.patchService({ url, payload, params, options });

  }

  // PUT API Method

  putService({ url = "", payload = {}, params = {}, options = {} }: { url: string, payload?: any, params?: any, options?: any }): any {

    if(options.loaderState) this._loading.setLoading({ loading: true, url: this.apiservice.baseUrl + url });    

    return this.apiservice.putService({ url, payload, params, options });

  }

  // GET API Method  

  getService({ url = "", params = {}, options = {} } : { url: string, params?: any, options?: any }): any {

    if(options.loaderState) this._loading.setLoading({ loading: true, url: this.apiservice.baseUrl + url });

    return this.apiservice.getService({ url, params, options });

  }

  // DELETE API Method

  deleteService({ url = "", params = {} } : { url: string, params?: any }): any {

    return this.apiservice.deleteService({ url, params });

  }

  // POST Method While Pass Form Data

  postFile({ url = "", formData = {}, params = {}, options = {} }: { url: string, formData: any, params?: any, options?: any }): any {

    if(options.loaderState) this._loading.setLoading({ loading: true, url: this.apiservice.baseUrl + url });

    return this.apiservice.postFile({ url, formData, params, options });

  }

  // GET Method While Getting File

  getFile({ url = "" }: { url: string }): Observable<Blob> {

    return this.apiservice.getFile({ url });

  }  

  // Common SnackBar Toastr

  showToastr(toastData : ToastrConfigData) {    

    let data : any = toastData;
    
    toastData['data']['type'] = toastData?.data?.type !== undefined ? toastData?.data?.type : 'info';

    toastData['duration']= toastData?.duration !== undefined ? toastData?.duration : 2500 ;

    toastData['horizontalPosition'] = toastData?.horizontalPosition !== undefined ? toastData?.horizontalPosition : "center";

    toastData['verticalPosition'] = toastData?.verticalPosition !== undefined ? toastData?.verticalPosition : "top";
    
    this.snackBar.openFromComponent(CommonToastrComponent, data);

  }  

  navigate({ url = "", queryParams = {} }:{url: string, queryParams?: any}) {

    this.router.navigate([url], { queryParams });

  }

  goBack() { window.history.back(); }

  logout() {

    this.session({ "method": "clear" });

    this.navigate({ "url": '/auth/login' });

  }

  // Validate Password and Confirm Password

  matchValidator(controlName: string, matchingControlName: string): any {

    return (formGroup: FormGroup) => {

        const control = formGroup.get(controlName);
        
        const matchingControl = formGroup.get(matchingControlName);
        
        if (matchingControl!.errors && !matchingControl!.errors?.['confirmedValidator']) return null;

        if (control!.value !== matchingControl!.value) {

          const error = { confirmedValidator: 'Passwords do not match.' };

          matchingControl!.setErrors(error);

          return error;

        } else {

          matchingControl!.setErrors(null);

          return null;

        }

    }

  }  

  updateValidators({ formGroup = new FormGroup({}), formControls = [] , validators = [] }: { formGroup: FormGroup, formControls: Array<any>, validators?: Array<any> }) {

    for (const element of formControls) {

      validators = _.isString(element) ? validators : element.validators || validators;

      const fieldName = _.isString(element) ? element : element.fieldName;

      formGroup.controls[fieldName]?.setValidators(validators);

      formGroup.controls[fieldName]?.updateValueAndValidity();

    }

  }

  menuList: any = [
    {
        "label": "Dashboard",
        "url": "dashboard",
        "icon": "bi bi-bar-chart",
    },
    {
        "label": "Account Setup",
        "url": "account-setup",
        "icon": "bi bi-file-earmark-plus",
        "subMenu" : [
            {
                "label": "Company",
                "url": "account-setup/company",
                "icon": "bi bi-building",
                "subMenu" : [
                    {
                        "label": "Company Details",
                        "url": "account-setup/company/company-details"
                    },
                    {
                        "label": "Address Details",
                        "url": "account-setup/company/address-details"
                    },
                    {
                        "label": "Service Details",
                        "url": "account-setup/company/service-details"
                    },            
                    {
                        "label": "Account Details",
                        "url": "account-setup/company/account-details"
                    },
                    {
                        "label": "Working Hours",
                        "url": "account-setup/company/working-hours"
                    }   
                ]
            },
            {
                "label": "Users",
                "url": "account-setup/users",
                "icon": "bi bi-person-workspace",
                "subMenu" : [
                    {
                        "label": "All Users",
                        "url": "account-setup/users/users"
                    },
                    {
                        "label": "Roles & Permissions",
                        "url": "account-setup/users/roles-and-permissions" 
                    }
                ]
            },
            {
                "label": "Locations & Charges",
                "url": "account-setup/location",
                "icon": "bi bi-geo-alt"
            },
            {
                "label": "Timeslot",
                "url": "account-setup/timeslot",
                "icon": "bi bi-clock-history"
            },
            {
                "label": "Items Pricing",
                "url": "account-setup/item-pricing",
                "icon": "bi-coin"
            }, 
            {
                "label": "My Subscription",
                "url": "account-setup/subscription",
                "icon": "bx bx-coin"
            }
        ]
    },
    {
        "label": "Create Order",
        "url": "create-order",
        "icon": "bi bi-cart-plus"
    },
    {
        "label": "Orders",
        "url": "orders",
        "icon": "bi bi-calendar2-check"
    },
    {
        "label": "Customers",
        "url": "customers",
        "icon": "bi-person-vcard"
    },
    {
        "label": "Reports",
        "url": "reports",
        "icon": "bi bi-bar-chart"
    }
  ];

  
}
