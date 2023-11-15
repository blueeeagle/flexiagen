import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { NgbAlert } from "@ng-bootstrap/ng-bootstrap";
import { Subject, debounceTime } from "rxjs";




@Component({
  selector: 'app-company-details',
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.scss']
})
export class CompanyDetailsComponent {

  companyDetailsFrom: FormGroup = new FormGroup({});
  editData: any = {};
  formSubmitted: boolean = false;

	// @ViewChild('staticAlert', { static: false }) staticAlert: NgbAlert;
	@ViewChild('selfClosingAlert', { static: false }) selfClosingAlert!: NgbAlert;

	constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef,) {}

	ngOnInit() {

    this.loadForm();
	
	}

  loadForm() {

    this.companyDetailsFrom = this.fb.group({

      'companyName': [ this.editData?.companyName || '', Validators.required ],

      'ownerName': [ this.editData?.ownerName || '', Validators.required ],

      'isTax': [ this.editData?.isTax || false, Validators.required ],

      'taxationNo': [ this.editData?.taxationNo || '', Validators.required ],

      'companyLogo': [ this.editData?.companyLogo || '', Validators.required ],

    });

  }

  get f(): any { return this.companyDetailsFrom.controls; }


}
