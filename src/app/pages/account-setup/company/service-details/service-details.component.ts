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
  _: any = _;

	constructor(public service: CommonService, private cdr: ChangeDetectorRef) {

    this.userSubscribe = this.service.userDetailsObs.subscribe((value)=>{

      if(!_.isEmpty(value)) this.loadForm();
      
    })

  }

	ngOnInit() {

    this.loadForm();
	
	}

  loadForm() {

    this.serviceDetailsFrom = this.service.fb.group({

      'pos': [ this.service.userDetails?.pos || false ],

      'online': [ this.service.userDetails?.online || false ],

      'logistics': [ this.service.userDetails?.logistics || false ],

    });

  }

  get f(): any { return this.serviceDetailsFrom.controls; }

  submit() {

    let payload = this.serviceDetailsFrom.value;

    if(!payload.pos && !payload.online) return this.service.showToastr({ "data": { "message": "Please select atleast one service", "type": "error" } });    

    this.isLoading = true;

    this.service.patchService({ "url": `/me/serviceDetails`, 'payload': payload }).subscribe((res: any) => {

      if(res.status=='ok') {

        this.service.showToastr({ "data": { "message": "Service details updated successfully", "type": "success" } });

        this.isLoading = false;

        this.service.userDetails = { ..._.omit(res.data,'companyId'), "companyId": res.data.companyId._id };

        this.service.companyDetails = _.get(res.data,'companyId');

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
