import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { NgbAlert } from "@ng-bootstrap/ng-bootstrap";
import { Subject, debounceTime } from "rxjs";

@Component({
  selector: 'app-address-details',
  templateUrl: './address-details.component.html',
  styleUrls: ['./address-details.component.scss']
})
export class AddressDetailsComponent {

  addressDetailsFrom: FormGroup = new FormGroup({});
  editData: any = {};
  formSubmitted: boolean = false;

	// @ViewChild('staticAlert', { static: false }) staticAlert: NgbAlert;
	@ViewChild('selfClosingAlert', { static: false }) selfClosingAlert!: NgbAlert;

	constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef,) {}

	ngOnInit() {

    this.loadForm();
	
	}

  loadForm() {

    this.addressDetailsFrom = this.fb.group({

      'street': [ this.editData?.street || '', Validators.required ],

      'appartment': [ this.editData?.appartment || '', Validators.required ],

      'area': [ this.editData?.area || '', Validators.required ],

      'city': [ this.editData?.city || '', Validators.required ],

      'state': [ this.editData?.state || '', Validators.required ],

      'country': [ this.editData?.country || '', Validators.required ],

      'pinCode' : [ this.editData?.pinCode || '', Validators.required ],


    });

  }

  get f(): any { return this.addressDetailsFrom.controls; }

}
