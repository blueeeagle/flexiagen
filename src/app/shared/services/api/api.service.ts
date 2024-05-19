import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { throwError, Observable } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { APP_CONFIG } from '@env/environment';
import * as CryptoJS from 'crypto-js';
import * as _ from 'lodash';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  public baseUrl: string = APP_CONFIG.APP_DOMAIN;
  public encryptedReq = APP_CONFIG.encryptedReq;

  constructor(private http: HttpClient) { }

  // POST API Method While Pass JSON Data
  postService({ _baseUrl = this.baseUrl, url = "", payload = {}, params = {}, options = {} }: { _baseUrl?: any, url: string, payload?: any, params?:any, options?: any }): any {

    if(this.encryptedReq) {

      payload = { "data" : this.encryptData(JSON.stringify(payload)) };

      url = this.encryptData(url);

    }

    let headers = new HttpHeaders({});

    if(!_.isEmpty(options.headers)) headers = new HttpHeaders(options.headers);

    return this.http.post(_baseUrl + url, payload, { "params": params }).pipe(

      map((res) => res),

      catchError((err) => throwError(err))

    );
    
  }
  
  // PATCH API Method
  patchService({ _baseUrl = this.baseUrl, url = "", payload = {}, params = {}, options = {} }: { _baseUrl?: any, url: string, payload?: any, params?:any, options?: any }): any {

    if(this.encryptedReq) {

      payload = { "data" : this.encryptData(JSON.stringify(payload)) };

      url = this.encryptData(url);

    }

    let headers = new HttpHeaders({});

    if(!_.isEmpty(options.headers)) headers = new HttpHeaders(options.headers);    

    return this.http.patch(_baseUrl + url, payload, { "params" : params }).pipe(

      map((res) => res),

      catchError((err) => throwError(err))

    );

  }

  // PUT API Method

  putService({ _baseUrl = this.baseUrl, url = "", payload = {}, params = {}, options = {} }: { _baseUrl?: any, url: string, payload?: any, params?:any, options?: any }): any {

    if(this.encryptedReq) {

      payload = { "data" : this.encryptData(JSON.stringify(payload)) };

      url = this.encryptData(url);

    }

    let headers = new HttpHeaders({});

    if(!_.isEmpty(options.headers)) headers = new HttpHeaders(options.headers);    

    return this.http.put(_baseUrl + url, payload, { "params" : params}).pipe(

      map((res) => res),

      catchError((err) => throwError(err))

    );

  }

  // GET API Method  

  getService({ _baseUrl = this.baseUrl, url = "", params = {}, options = {} }: { _baseUrl?: any, url: string, params?: any, options?: any }): any {

    if(this.encryptedReq)

      url = this.encryptData(url);

      return this.http.get(_baseUrl + url, {"params": params}).pipe(

        map((res) => res),

        catchError(err => throwError(err))

      );
  }

  // DELETE API Method

  deleteService({ _baseUrl = this.baseUrl, url = "", params = {}, options = {} }: { _baseUrl?: any, url: string, params?: any, options?: any }): any {

    if(this.encryptedReq) url = this.encryptData(url);    

    return this.http.delete(_baseUrl + url, { "params" : params}).pipe(

      map((res) => res),

      catchError((err) => throwError(err))

    );

  }

  // POST Method While Pass Form Data

  postFile({ _baseUrl = this.baseUrl, url = "", formData = {}, params = {}, options = {} }: { _baseUrl?: any, url: string, formData: any, params?: any, options?: any }): any {

    if(this.encryptedReq) url = this.encryptData(url);

      return this.http.post(_baseUrl + url, formData, { "params": params }).pipe(

        map((res) => res),

        catchError((err) => throwError(err))

      );

  }

  // GET Method While Getting File

  getFile({ _baseUrl = this.baseUrl, url = "" }: { _baseUrl?: any, url: string }): Observable<Blob> {

    if(this.encryptedReq) url = this.encryptData(url);    

    return this.http.get(_baseUrl + url, { responseType: "blob" }).pipe(

      map((res) => res),

      catchError((err) => throwError(err))

    );

  }

  // Encrypt the passing plain text using crypto js encryption
  encryptData(plainText: string): string {
    let encryptedData = CryptoJS.AES.encrypt(plainText, APP_CONFIG.secretKey).toString();
    return encryptedData;
  }

  // Decrypt the passing plain text using crypto js decryption
  decryptData(encryptedText: string): string {
    var decryptedData = CryptoJS.AES.decrypt(encryptedText, APP_CONFIG.secretKey).toString(CryptoJS.enc.Utf8);
    return decryptedData;
  }

}
