
import { ChangeDetectorRef, Component } from "@angular/core";
import { FormArray, FormGroup, Validators } from "@angular/forms";
import { CommonService } from "@shared/services/common/common.service";
import * as _ from "lodash";
import * as moment from "moment";
import { forkJoin } from "rxjs";

@Component({
  selector: 'app-working-hours',
  templateUrl: './working-hours.component.html',
  styleUrls: ['./working-hours.component.scss']
})
export class WorkingHoursComponent {

  workingHoursFrom: FormGroup = new FormGroup({});
  workingDays: any = [];
  formSubmitted: boolean = false;
  daysOfWeek = ['Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  timeOptions = [
    { "value": "00:00", "label": "12:00 AM" }, { "value": "01:00", "label": "01:00 AM" },
    { "value": "02:00", "label": "02:00 AM" }, { "value": "03:00", "label": "03:00 AM" },
    { "value": "04:00", "label": "04:00 AM" }, { "value": "05:00", "label": "05:00 AM" },
    { "value": "06:00", "label": "06:00 AM" }, { "value": "07:00", "label": "07:00 AM" },
    { "value": "08:00", "label": "08:00 AM" }, { "value": "09:00", "label": "09:00 AM" }, 
    { "value": "10:00", "label": "10:00 AM" }, { "value": "11:00", "label": "11:00 AM" }, 
    { "value": "12:00", "label": "12:00 PM" }, { "value": "13:00", "label": "01:00 PM" }, 
    { "value": "14:00", "label": "02:00 PM" }, { "value": "15:00", "label": "03:00 PM" }, 
    { "value": "16:00", "label": "04:00 PM" }, { "value": "17:00", "label": "05:00 PM" }, 
    { "value": "18:00", "label": "06:00 PM" }, { "value": "19:00", "label": "07:00 PM" }, 
    { "value": "20:00", "label": "08:00 PM" }, { "value": "21:00", "label": "09:00 PM" }, 
    { "value": "22:00", "label": "10:00 PM" }, { "value": "23:00", "label": "11:00 PM" },
    { "value": "24:00", "label": "12:00 AM" }
  ];
  userSubscribe: any;
  isLoading: boolean = false;
  submitIndex: number = 0;
  _: any = _;

	constructor(public service: CommonService) {

    this.service.setApiLoaders({ 'isLoading': true, 'url': ['/setup/workingHrs/list'] });

    if(!_.isEmpty(this.service.companyDetails)) this.getWorkingHours();

    this.userSubscribe = this.service.userDetailsObs.subscribe((data: any) => {

      if(!_.isEmpty(data)) {
        
        this.getWorkingHours();

      }

    });

    this.loadForm();

  }

	ngOnInit() {}

  getWorkingHours() {

    this.service.postService({ 'url': '/setup/workingHrs/list' }).subscribe((res: any) => {

      if(res.status == 'ok') {

        this.workingDays = _.map(res.data, (value: any) => {

          value.availableTimes = _.map(value.availableTimes, (e)=> {

            e.startTime = e.startTime.hour.toString().padStart(2, '0') + ':' + e.startTime.minute.toString().padStart(2, '0');

            e.endTime = e.endTime.hour.toString().padStart(2, '0') + ':' + e.endTime.minute.toString().padStart(2, '0');

            return e;

          });

          return { ..._.pick(value, ['_id','availableTimes','day','is_active']) };

        });

        this.loadForm();

      }

    });

  }

  loadForm() {

    this.workingHoursFrom = this.service.fb.group({

      'workingDays': this.service.fb.array([]),

    });

    this.daysOfWeek.forEach((day: string, index: number) => {

      let dayDetails = _.find(this.workingDays, { 'day': day }) || {};

      if(_.isEmpty(dayDetails)) {

        this.wdf.push(this.getFormArray({ 'value':  { day } }));
  
        this.whf(index).push(this.getFormArray({ 'type': 'workingHours' }));
  
        this.whf(index).at(0).patchValue({ 'startTime': '09:00', 'endTime': '17:00' });

      } else {

        this.wdf.push(this.getFormArray({ 'value': dayDetails }));

        dayDetails.availableTimes.forEach((timeDet: any, indexTwo: number) => {

          this.whf(index).push(this.getFormArray({ 'value': timeDet, 'type': 'workingHours' }));

        });

      }
      
    });

  }

  get f(): any { return this.workingHoursFrom.controls; }

  get wdf(): any { return this.f.workingDays as FormArray; }

  whf(index: any): any { return this.wdf.at(index).get('availableTimes') as FormArray; }

  getFormArray({ value = {}, type = 'workingDays' }: { value?: any, type?: 'workingDays' | 'workingHours'  }): any {

    if(type == 'workingDays') {
    
      return this.service.fb.group({

        '_id': value?._id || null,

        'companyId': value?.companyId || this.service.companyDetails?._id || null,

        'day': value?.day || '',

        'is_active': value?.is_active || false,

        'availableTimes': this.service.fb.array([]),

      });

    } else if(type == 'workingHours') {

      return this.service.fb.group({

        'startTime': [value?.startTime || null, Validators.required],

        'endTime': [value?.endTime || null, Validators.required]

      });

    }

  }

  isTimeAvailable({ fieldName = 'startTime', option = "09:00", wdIndx = -1, timeIndx = -1 }: { fieldName: 'startTime' | 'endTime' ,option: string, wdIndx?: number, timeIndx?: number }): boolean {
    
    let availableTimes = this.wdf.at(wdIndx).getRawValue().availableTimes;

    let beforeSlotDetails = availableTimes[timeIndx-1] || { 'startTime': '00:00', 'endTime': '00:00' };

    let isAvailable = true;

    // allow time after previous slot start time

    if(fieldName == 'startTime' && moment(option, 'HH:mm').isBefore(moment(beforeSlotDetails.endTime, 'HH:mm'))) isAvailable = false;

    let nextTimeDet = this.timeOptions[_.findIndex(this.timeOptions,{ 'value': beforeSlotDetails.endTime })+1];

    // allow time before next slot end time

    if(fieldName == 'endTime' && moment(option, 'HH:mm').isBefore(moment(nextTimeDet?.value, 'HH:mm'))) isAvailable = false;

    return !isAvailable;

  }

  addWorkingHours(index: number) {

    let availableTimes = this.whf(index).getRawValue();

    let timeOptionsList = _.filter(this.timeOptions,(e)=> moment(e.value, 'HH:mm').isAfter(moment(availableTimes[availableTimes.length-1].endTime, 'HH:mm')));
    
    if(timeOptionsList.length >= 2) this.whf(index).push(this.getFormArray({ 'type': 'workingHours' }));

    else this.service.showToastr({ "data": { "message": "No time available", "type": "error" } });

  }

  changeValue({ fieldName = "", index = -1, indexTwo = -1 }: { fieldName?: string, index?: number, indexTwo?: number }) {

    let formGroup: any = index > -1 && indexTwo > -1 ? 
    
      this.whf(index).at(indexTwo) as FormGroup : 
      
        index > -1 && indexTwo == -1 ? 
        
          this.wdf.at(index) as FormGroup : 
          
            this.workingHoursFrom;

    let formValue = formGroup.getRawValue();

    if(fieldName == 'startTime') {

      let availableTimes = this.wdf.at(index).getRawValue().availableTimes;

      if(moment(formValue.startTime, 'HH:mm').isAfter(moment(formValue.endTime, 'HH:mm')) || formValue.startTime == formValue.endTime) {

        formGroup.get('endTime').setValue(null);

        return this.service.showToastr({ "data": { "message": "End time should be greater than start time", "type": "error" } });

      }

      availableTimes.forEach((timeDet: any, indx: number) => {

        if(indx <= indexTwo) return;

        this.whf(index).at(indx).patchValue({ 'startTime': null, 'endTime': null });

      });

    } else if(fieldName == 'endTime') {

      let availableTimes = this.wdf.at(index).getRawValue().availableTimes;

      if(moment(formValue.endTime, 'HH:mm').isBefore(moment(formValue.startTime, 'HH:mm'))) {

        formGroup.get('endTime').setValue(null);

        return this.service.showToastr({ "data": { "message": "End time should be greater than start time", "type": "error" } });

      }

      availableTimes.forEach((timeDet: any, indx: number) => {

        if(indx <= indexTwo) return;

        this.whf(index).at(indx).patchValue({ 'startTime': null, 'endTime': null });

      });

    } 

  }

  submit(index: number) {

    this.formSubmitted = true;

    if(this.wdf.at(index).invalid) return this.service.showToastr({ 'data': { 'message': 'Please fill all the required fields', 'type': 'error' } });

    let payload = _.cloneDeep(this.wdf.at(index).getRawValue());

    this.submitIndex = index;

    this.isLoading = true;

    payload['availableTimes'] = _.map(payload.availableTimes, (e)=>{

      e.startTime = { hour: parseInt(e.startTime.split(":")[0]), minute: parseInt(e.startTime.split(":")[1]) };

      e.endTime = { hour: parseInt(e.endTime.split(":")[0]), minute: parseInt(e.endTime.split(":")[1]) };

      return e

    });

    forkJoin({

      result: _.isNull(payload._id) ? 

        this.service.postService({ 'url': '/setup/workingHrs', 'payload': _.omit(payload,'_id') }) :

          this.service.patchService({ 'url': `/setup/workingHrs/${payload._id}`, 'payload': payload })

    }).subscribe({

      next: (res: any) => {

        this.isLoading = false;

        if(res.result.status == 'ok') {

          this.wdf.at(index).patchValue({ '_id': res.result.data._id });

          this.service.showToastr({ 'data': { 'message': res.result.message, 'type': 'success' } });

        }

      },

      error: (err: any) => {

        this.isLoading = false;

        this.service.showToastr({ 'data': { 'message': err?.error?.error || err?.error?.message || 'Something went wrong', 'type': 'error' } });

      }

    });

  }

  ngOnDestroy() {

    this.userSubscribe.unsubscribe();

  }

}