import { ChangeDetectorRef, Component } from "@angular/core";
import { FormArray, FormGroup, Validators } from "@angular/forms";
import { CommonService } from "@shared/services/common/common.service";
import * as _ from "lodash";

@Component({
  selector: 'app-working-hours',
  templateUrl: './working-hours.component.html',
  styleUrls: ['./working-hours.component.scss']
})
export class WorkingHoursComponent {

  workingHoursFrom: FormGroup = new FormGroup({});
  editData: any = {};
  formSubmitted: boolean = false;
  mode: 'Create' | 'Update' = 'Create';
  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

	constructor(private service: CommonService, private cdr: ChangeDetectorRef,) {}

	ngOnInit() {

    this.loadForm();
	
	}

  loadForm() {

    this.workingHoursFrom = this.service.fb.group({

      'companyId': [ this.editData?.companyId?._id || this.service.companyDetails._id, Validators.required ],

      'isDefault': true,

      'workingDays': this.service.fb.array([]),

    });

    if(this.mode == 'Create') {

      this.daysOfWeek.forEach((day: string, index: number) => {

        this.wdf.push(this.getFormArray({ 'value': { day } }));

        this.whf(index).push(this.getFormArray({ 'type': 'workingHours' }));
        
      });

    } else if(this.mode == 'Update') {

      this.editData.workingDays.forEach((day: any, index: number) => {

        this.wdf.push(this.getFormArray({ 'value': day }));

        day.availableTimes.forEach((timeDet: any, indexTwo: number) => {

          this.whf(index).push(this.getFormArray({ 'value': timeDet, 'type': 'workingHours' }));

        });

      });

    }

    console.log(this.workingHoursFrom);

  }

  get f(): any { return this.workingHoursFrom.controls; }

  get wdf(): any { return this.f.workingDays as FormArray; }

  whf(index: any): any { return this.wdf.at(index).get('availableTimes') as FormArray; }

  getFormArray({ value = {}, type = 'workingDays' }: { value?: any, type?: 'workingDays' | 'workingHours'  }): any {

    if(type == 'workingDays') {
    
      return this.service.fb.group({

        'day': value?.day || '',

        'is_active': value?.is_active || true,

        'availableTimes': this.service.fb.array([]),

      });

    } else if(type == 'workingHours') {

      return this.service.fb.group({

        'startTime': value?.startTime || '09:00',

        'endTime': value?.endTime || '18:00'

      });

    }

  }

  addWorkingHours(index: number) {

    this.whf(index).push(this.getFormArray({ type: 'workingHours' }));

  }

  removeWorkingHours(index: number, indexTwo: number) {

    if(this.whf(index).length == 1)  {
      
    } else {

      this.whf(index).removeAt(indexTwo);

    }


  }

  changeValue({ fieldName = "", index = -1, indexTwo = -1 }: { fieldName?: string, index?: number, indexTwo?: number }) {

    let formGroup = index > -1 && indexTwo > -1 ? 
    
      this.whf(index).at(indexTwo) as FormGroup : 
      
        index > -1 && indexTwo == -1 ? 
        
          this.wdf.at(index) as FormGroup : 
          
            this.workingHoursFrom;

    if(fieldName == 'is_active') {

      this.whf(index).at(indexTwo).get('startTime').setValue('09:00');

      this.whf(index).at(indexTwo).get('endTime').setValue('18:00');

    } else if(fieldName == 'startTime') {


    } else if(fieldName == 'endTime') {


    }

  }

  submit() {

    this.formSubmitted = true;

    if(this.workingHoursFrom.invalid) return;

    let payload = _.cloneDeep(this.workingHoursFrom.value);

    payload = _.map(payload.workingDays, (value: any) => {

      return { ..._.omit(payload,'workingDays'), ...value };

    });

    console.log(payload);

  }

}
