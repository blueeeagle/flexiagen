import { ChangeDetectorRef, Component } from "@angular/core";
import { FormGroup, Validators } from "@angular/forms";
import { CommonService } from "@shared/services/common/common.service";
import * as _ from "lodash";

@Component({
  selector: 'app-service-details',
  templateUrl: './service-details.component.html',
  styleUrls: ['./service-details.component.scss']
})
export class ServiceDetailsComponent {

  serviceDetailsFrom: FormGroup = new FormGroup({});
  isLoading: boolean = false;
  userSubscribe: any;
  appServiceChargeDet: any = { 'pos': '0', 'online': '0', 'logistics': '0' };
  _: any = _;

	constructor(public service: CommonService, private cdr: ChangeDetectorRef) {

    if(!_.isEmpty(this.service.companyDetails)) {

      this.service.setApiLoaders({ 'isLoading': true, 'url': [`/setup/charges/${this.service.companyDetails.addressDetails.countryId._id}`] });
      
      this.getAppServiceCharges();

    }

    this.userSubscribe = this.service.userDetailsObs.subscribe((value)=>{

      if(!_.isEmpty(value)) {

        this.loadForm();

        this.service.setApiLoaders({ 'isLoading': true, 'url': [`/setup/charges/${this.service.companyDetails.addressDetails.countryId._id}`] });

        this.getAppServiceCharges();

      }
      
    })

  }

	ngOnInit() {

    this.loadForm();
	
	}

  // Get Application Service List

  getAppServiceCharges() {

    this.appServiceChargeDet = { 'pos': '0', 'online': '0', 'logistics': '0' };

    this.service.getService({ "url": `/setup/charges/${this.service.companyDetails.addressDetails.countryId._id}` }).subscribe((res: any) => {

      if(res.status=='ok') {

        _.reduce({ 'pos': '0', 'online': '0', 'logistics': '0' }, (result: any, v: any, key: any) => {

          let chargesDet = _.find(res.data.charges, { 'name': key });

          const { value, type } = chargesDet;

          result[key] = type == 'percentage' ? `${value}%` : `${value.toFixed(this.service.currencyDetails.decimalPoints || 3)} ${this.service.currencyDetails.currencyCode}`;

          return result;

        }, this.appServiceChargeDet);

      }

    });

  }  

  loadForm() {

    this.serviceDetailsFrom = this.service.fb.group({

      'pos': [ this.service.userDetails?.pos || false ],

      'online': [ this.service.userDetails?.online || false ],

      'logistics': [ this.service.userDetails?.logistics || false ],

    });

    this.serviceDetailsFrom.get('online')?.valueChanges.subscribe((value: any) => {

      if(value) this.serviceDetailsFrom.get('logistics')?.enable();

      else this.f.logistics.disable();

      this.f.logistics.setValue(value);

      this.f.logistics.updateValueAndValidity();

    });    

  }

  get f(): any { return this.serviceDetailsFrom.controls; }

  submit() {

    let payload = this.serviceDetailsFrom.getRawValue();

    if(!payload.pos && !payload.online) return this.service.showToastr({ "data": { "message": "Please select atleast one service", "type": "error" } });    

    this.isLoading = true;

    this.service.patchService({ "url": `/me/serviceDetails`, 'payload': payload }).subscribe((res: any) => {

      if(res.status=='ok') {

        this.service.showToastr({ "data": { "message": "Service details updated successfully", "type": "success" } });

        this.isLoading = false;

        this.service.userDetails = { ..._.omit(res.data,'companyId'), "companyId": res.data.companyId._id };

        this.service.companyDetails = _.get(res.data,'companyId');

        this.service.session({ "method": "set", "key": "CompanyDetails", "value": JSON.stringify(this.service.companyDetails) });

        this.service.session({ "method": "set", "key": "UserDetails", "value": JSON.stringify(this.service.userDetails) });

        this.service.userDetailsObs.next(res.data);

      }
    
    });

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.userSubscribe.unsubscribe();
  }

}
