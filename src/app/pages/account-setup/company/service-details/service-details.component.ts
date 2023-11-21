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

	constructor(private service: CommonService, private cdr: ChangeDetectorRef) {

    this.service.userDetailsObs.subscribe((value)=>{

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

      'mLogistic': [ this.service.userDetails?.mLogistic || false ],

    });

  }

  get f(): any { return this.serviceDetailsFrom.controls; }

  submit() {

    let payload = this.serviceDetailsFrom.value;

    if(!payload.pos && !payload.online) return this.service.showToastr({ "data": { "message": "Please select atleast one service", "type": "error" } });    

    this.isLoading = true;

    this.service.postService({ "url": `/users/update/${this.service.userDetails.id}`, 'payload': payload }).subscribe((res: any) => {

      if(res.status == 200) {

        this.service.showToastr({ "data": { "message": "Service details updated successfully", "type": "success" } });

        this.isLoading = false;

        this.service.getUserDetails.subscribe((userRes: any) => {

          this.service.userDetails = userRes.data;

          this.service.userDetailsObs.next(userRes.data);

        });

      }

    });

  }

}
