import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpHeaders,
} from '@angular/common/http';
import { NEVER, Observable } from 'rxjs';
import { CommonService } from '@shared/services/common/common.service';
import { LoadingService } from '@shared/services/loading/loading.service';

@Injectable()
export class MainInterceptor implements HttpInterceptor {
 
  private requests: HttpRequest<any>[] = [];

  constructor(private service: CommonService, private _loading: LoadingService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (this.service.session({ "method": 'get', "key": 'AuthToken'}) != null) {

      const token = this.service.session({ "method": 'get', "key": 'AuthToken' });

      const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);

      const AuthRequest = request.clone({ headers });

      return new Observable(observer => {

        const subscription = next.handle(AuthRequest).subscribe((event: any): any => {

          if (event instanceof HttpResponse) {

            this._loading.setLoading({ 'loading': false, 'url': request.url })

            observer.next(event);

          }
            

        }, (err: any) => {

          if (err.status == 403) {

            this.service.showToastr({ "data": { message: 'Sorry Session Expired 👋', type: 'error' } });

            this.service.logout();

          }

          this._loading.setLoading({ 'loading': false, 'url': request.url })

          observer.error(err);
          
        }, () => {

          observer.complete();

        });

        // teardown logic in case of cancelled requests

        return () => {

          subscription.unsubscribe();

        };

      });

    } else {     

      return next.handle(request);

    }

  }
  
}
