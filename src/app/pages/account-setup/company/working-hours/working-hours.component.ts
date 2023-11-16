import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { NgbAlert } from "@ng-bootstrap/ng-bootstrap";
import { Subject, debounceTime } from "rxjs";

@Component({
  selector: 'app-working-hours',
  templateUrl: './working-hours.component.html',
  styleUrls: ['./working-hours.component.scss']
})
export class WorkingHoursComponent {

  
  workingHoursFrom: FormGroup = new FormGroup({});
  editData: any = {};
  formSubmitted: boolean = false;

  daysOfWeek = [

    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday","Sunday"
    
  ];

	// @ViewChild('staticAlert', { static: false }) staticAlert: NgbAlert;
	@ViewChild('selfClosingAlert', { static: false }) selfClosingAlert!: NgbAlert;

	constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef,) {}

	ngOnInit() {

    this.loadForm();
	
	}

  loadForm() {

    this.workingHoursFrom = this.fb.group({

      'companyName': [ this.editData?.companyName || '', Validators.required ],

    });

  }

  get f(): any { return this.workingHoursFrom.controls; }




}
