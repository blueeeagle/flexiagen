import { Injectable } from '@angular/core';
import { DatePipe, DecimalPipe} from '@angular/common';
import { Router } from '@angular/router';
import { APP_CONFIG } from '@env/environment';
import { ApiService } from '../api/api.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastrConfigData } from '@shared/components/common-toastr/toastr-data.interface';
import { CommonToastrComponent } from '@shared/components';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as _ from 'lodash';
import { FormBuilder } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  pageSizeList: any = [10, 25, 50, 100];
  userDetails: any = {};

  public isLoading = new BehaviorSubject(false);
  public loaderApiUrls = new BehaviorSubject<any>([]);
  public imgSrc = APP_CONFIG.imgSrc;

  constructor(private router: Router, private apiservice: ApiService, private snackBar: MatSnackBar, public decimalPipe: DecimalPipe, public fb: FormBuilder) {}

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

  // POST API Method While Pass JSON Data
  
  postService({ url = "", payload = {}, params = {}, loaderState = false} : {url: string, payload?: any, params?: any, loaderState?: boolean}): any {

    if (loaderState) this.loaderApiUrls.subscribe(item => { item.push(this.apiservice.baseUrl + url); });

    return this.apiservice.postService(url, payload, params);
    
  }

  // PATCH API Method

  patchService({ url = "", payload = {}, params = {}} : {url: string, payload?: any, params?: any}): any {

    return this.apiservice.patchService(url, payload, params);

  }

  // PUT API Method

  putService(url: string, data?: any, params?: any): any {

    return this.apiservice.putService(url, data, params);

  }

  // GET API Method  

  getService({ url = "", params = {}, loaderState = false } : { url: string, params?: any, loaderState?: boolean }): any {

    if (loaderState) this.loaderApiUrls.subscribe(item => { item.push(this.apiservice.baseUrl + url); });

    return this.apiservice.getService(url,params);

  }

  // DELETE API Method

  deleteService(url: string,params?: any): any {

    return this.apiservice.deleteService(url, params);

  }

  // POST Method While Pass Form Data

  postFile(url: string, formData: any): any {

    return this.apiservice.postFile(url, formData);

  }

  // GET Method While Getting File

  getFile(url: string): Observable<Blob> {

    return this.apiservice.getFile(url);

  }  

  // Common SnackBar Toastr

  showToastr(toastData : ToastrConfigData) {    

    let data : any = toastData;
    
    toastData['data']['type'] = toastData?.data?.type !== undefined ? toastData?.data?.type : 'info';

    toastData['duration']= toastData?.duration !== undefined ? toastData?.duration : 2500;

    toastData['horizontalPosition'] = toastData?.horizontalPosition !== undefined ? toastData?.horizontalPosition : "center";

    toastData['verticalPosition'] = toastData?.verticalPosition !== undefined ? toastData?.verticalPosition : "top";
    
    this.snackBar.openFromComponent(CommonToastrComponent, data);

  }  

  navigate({ url = "", queryParams = {} }:{url: string, queryParams?: any}) {

    this.router.navigate([url], { queryParams });

  }

  goBack() {

    window.history.back();

  }

  logout() {

    sessionStorage.clear();

    sessionStorage.clear();

    this.navigate({ "url": '/auth/login' });

  }
  
}
