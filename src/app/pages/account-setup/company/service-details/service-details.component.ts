import { ChangeDetectorRef, Component } from "@angular/core";
import { FormGroup, Validators } from "@angular/forms";
import { CommonService } from "@shared/services/common/common.service";

@Component({
  selector: 'app-service-details',
  templateUrl: './service-details.component.html',
  styleUrls: ['./service-details.component.scss']
})
export class ServiceDetailsComponent {

  serviceDetailsFrom: FormGroup = new FormGroup({});
  editData: any = {};
  formSubmitted: boolean = false;

	constructor(private service: CommonService, private cdr: ChangeDetectorRef,) {}

	ngOnInit() {

    this.loadForm();
	
	}

  loadForm() {

    this.serviceDetailsFrom = this.service.fb.group({

      'mobileNo': [ this.editData?.serviceName || '', Validators.required ],

      'emailId': [ this.editData?.emailId || '', Validators.required ],

      'newPassword': [ this.editData?.newPassword || '', Validators.required ],

      'conformPassword': [ this.editData?.conformPassword || '', Validators.required ],

    });

  }

  get f(): any { return this.serviceDetailsFrom.controls; }


}
