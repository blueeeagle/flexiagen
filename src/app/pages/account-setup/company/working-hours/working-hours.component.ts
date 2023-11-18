import { ChangeDetectorRef, Component } from "@angular/core";
import { FormGroup, Validators } from "@angular/forms";
import { CommonService } from "@shared/services/common/common.service";

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

	constructor(private service: CommonService, private cdr: ChangeDetectorRef,) {}

	ngOnInit() {

    this.loadForm();
	
	}

  loadForm() {

    this.workingHoursFrom = this.service.fb.group({

      'companyName': [ this.editData?.companyName || '', Validators.required ],

    });

  }

  get f(): any { return this.workingHoursFrom.controls; }




}
