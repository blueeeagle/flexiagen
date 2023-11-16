import { ChangeDetectorRef, Component, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbAlert } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-service-details',
  templateUrl: './service-details.component.html',
  styleUrls: ['./service-details.component.scss']
})
export class ServiceDetailsComponent {

  serviceDetailsFrom: FormGroup = new FormGroup({});
  editData: any = {};
  formSubmitted: boolean = false;

	// @ViewChild('staticAlert', { static: false }) staticAlert: NgbAlert;
	@ViewChild('selfClosingAlert', { static: false }) selfClosingAlert!: NgbAlert;

	constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef,) {}

	ngOnInit() {

    this.loadForm();
	
	}

  loadForm() {

    this.serviceDetailsFrom = this.fb.group({

      'mobileNo': [ this.editData?.serviceName || '', Validators.required ],

      'emailId': [ this.editData?.emailId || '', Validators.required ],

      'newPassword': [ this.editData?.newPassword || '', Validators.required ],

      'conformPassword': [ this.editData?.conformPassword || '', Validators.required ],

    });

  }

  get f(): any { return this.serviceDetailsFrom.controls; }


}
