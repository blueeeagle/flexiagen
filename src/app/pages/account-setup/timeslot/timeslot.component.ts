import { Component } from '@angular/core';
import { FormArray, Validators } from '@angular/forms';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-timeslot',
  templateUrl: './timeslot.component.html',
  styleUrls: ['./timeslot.component.scss']
})
export class TimeslotComponent {

  timeslotForm: any;
  _: any = _;
  days: any = [ 
    { 'day': 'Sunday', 'isDefault': true, 'date': null },
    { 'day': 'Monday', 'isDefault': true, 'date': null },
    { 'day': 'Tuesday', 'isDefault': true, 'date': null },
    { 'day': 'Wednesday', 'isDefault': true, 'date': null },
    { 'day': 'Thursday', 'isDefault': true, 'date': null },
    { 'day': 'Friday', 'isDefault': true, 'date': null },
    { 'day': 'Saturday', 'isDefault': true, 'date': null }
  ];
  activeDays: Array<any> = [];
  selectedDay: any = {};
  totalTimeSlots: any = [
    { startTime: '00:00', endTime: '01:00', session: 'AM' }, { startTime: '01:00', endTime: '02:00', session: 'AM' },
    { startTime: '02:00', endTime: '03:00', session: 'AM' }, { startTime: '03:00', endTime: '04:00', session: 'AM' },
    { startTime: '04:00', endTime: '05:00', session: 'AM' }, { startTime: '05:00', endTime: '06:00', session: 'AM' },
    { startTime: '06:00', endTime: '07:00', session: 'AM' }, { startTime: '07:00', endTime: '08:00', session: 'AM' },
    { startTime: '08:00', endTime: '09:00', session: 'AM' }, { startTime: '09:00', endTime: '10:00', session: 'AM' },
    { startTime: '10:00', endTime: '11:00', session: 'AM' }, { startTime: '11:00', endTime: '12:00', session: 'AM' },
    { startTime: '12:00', endTime: '13:00', session: 'PM' }, { startTime: '13:00', endTime: '14:00', session: 'PM' },
    { startTime: '14:00', endTime: '15:00', session: 'PM' }, { startTime: '15:00', endTime: '16:00', session: 'PM' },
    { startTime: '16:00', endTime: '17:00', session: 'PM' }, { startTime: '17:00', endTime: '18:00', session: 'PM' },
    { startTime: '18:00', endTime: '19:00', session: 'PM' }, { startTime: '19:00', endTime: '20:00', session: 'PM' },
    { startTime: '20:00', endTime: '21:00', session: 'PM' }, { startTime: '21:00', endTime: '22:00', session: 'PM' },
    { startTime: '22:00', endTime: '23:00', session: 'PM' }, { startTime: '23:00', endTime: '24:00', session: 'PM' }
  ];
  availTimeSlots: any = [];
  editData: any = [];
  userSubscribe: any;
  workingDayDetails: Array<any> = [];
  sessionStatus: any = { "AM": false, "PM": false };
  isLoading: boolean = false;
  weekOptions: Array<any> = [];
  selectedWeekIndex: any = 0;
  selectedDate: any = moment().format('YYYY-MM-DD');
  loaderUrlList: any = ['/setup/workingHrs/list','/setup/timeslot/list'];

  constructor(public service: CommonService) { 

    this.weekOptions = _.map(Array(56), (val, index) => {

      let start = moment().add(index, 'weeks').startOf('week');

      let end = moment().add(index, 'weeks').endOf('week');

      return { 
      
        'label': `${start.format('DD MMM YY')} to ${end.format('DD MMM YY')}`,
      
        'value': { 'start': start.format('YYYY-MM-DD'), 'end': end.format('YYYY-MM-DD') } 
      
      };

    });

    this.service.setApiLoaders({ 'isLoading': true, 'url': this.loaderUrlList });

    this.loadForm();

    if(!_.isEmpty(this.service.companyDetails)) this.getWorkingHours();

    this.userSubscribe = this.service.userDetailsObs.subscribe((data: any) => {

      if(!_.isEmpty(data)) this.getWorkingHours();

    });

  }

  getWorkingHours() {
    
    this.service.postService({ 'url': '/setup/workingHrs/list', "payload": { 'is_active': true } }).subscribe((res: any) => {

        if(res.status=='ok') {

          this.workingDayDetails = res.data;

          this.activeDays = _.map(this.workingDayDetails, 'day');

          // sort active days based on days array order

          this.activeDays = _.sortBy(this.activeDays, (day: string) => _.findIndex(this.days, { 'day': day }));

          if(_.isEmpty(this.workingDayDetails)) this.service.setApiLoaders({ 'isLoading': false, 'url': ['/setup/timeslot/list'] });

          else this.changeValue({ 'fieldName': 'selectedWeek' });
          
        }

    });

  }

  getTimeSlots(day: any) {

    this.selectedDay = day;

    this.selectedDate = day?.date;

    this.service.postService({ 'url': '/setup/timeslot/list', 'payload': _.pickBy({ 'companyId': this.service.companyDetails._id, ...this.selectedDay }), "options": { "loaderState": true } }).subscribe((res:any)=>{

      this.editData = res?.status == 'ok' ? res.data : [];

      this.loadForm();
      
    })

  }

  loadForm() {

    this.timeslotForm = this.service.fb.group({

      "date": [ this.selectedDay?.date || null ],

      "timeSlots": this.service.fb.array([]),

    });

    this.editData.forEach((slotDet: any) => {

      slotDet['startTime'] = moment(slotDet['startTime']['hour'].toString().padStart(2,'0') + ':' + slotDet['startTime']['minute'].toString().padStart(2,'0'), 'HH:mm').format('HH:mm');

      slotDet['endTime'] = moment(slotDet['endTime']['hour'].toString().padStart(2,'0') + ':' + slotDet['endTime']['minute'].toString().padStart(2,'0'), 'HH:mm').format('HH:mm');

      this.ts.push(this.getTimeSlotForm({ slotDet }));

    });

    this.sessionStatus = { "AM": !_.isEmpty(_.find(this.editData,{ 'session': 'AM' })), "PM": !_.isEmpty(_.find(this.editData,{ 'session': 'PM' })) };

  }

  get f(): any { return this.timeslotForm.controls; }

  get ts(): any { return this.f.timeSlots as FormArray; }

  getLabel(label: any): string { return label.replace(/\b(?:am|pm)\b/g, ''); }

  checkIsActiveHour(startTime: any): string {

    return this.selectedDay?.date == moment().format("YYYY-MM-DD") ? moment(startTime,'HH:mm').isAfter(moment()) ? 'active' : 'Inactive' : 'active';

  }

  checkIsWorkingDay = (d: Date | null): boolean => {
    return _.includes(_.map(this.workingDayDetails,'day'), moment(d).format('dddd'));
  };

  getTimeSlotForm({ slotDet = {} }: { slotDet?: any }) {

    return this.service.fb.group({

      "_id": slotDet._id || null,

      "companyId": slotDet.companyId || null,

      "day": slotDet.day,

      "isDefault": slotDet.isDefault,

      "startTime": slotDet.startTime || '',

      "endTime": slotDet.endTime || '',

      "label": slotDet.label || "",

      "is_active": _.isBoolean(slotDet.is_active) ? slotDet.is_active : false,

      "session": slotDet.session || moment(slotDet.startTime, 'HH:mm').format('A')

    });

  }

  changeValue({ fieldName = "", day = "" }: { fieldName: string, day?: string }): any {

    if(fieldName == 'selectedWeek') {

      let selectedWeekRange = this.weekOptions[this.selectedWeekIndex];

      this.activeDays = _.map(this.workingDayDetails, 'day');

      this.activeDays = _.sortBy(this.activeDays, (day: string) => _.findIndex(this.days, { 'day': day }));

      _.map(Array(7), (value: any,index: number) => {
    
        this.days[index]['date'] = moment(selectedWeekRange.value.start).add(index, 'days').format('YYYY-MM-DD');

        if(moment(this.days[index]['date']).isBefore(moment().format('YYYY-MM-DD'))) {

          this.activeDays = _.without(this.activeDays, this.days[index]['day']);

        }
      
        return moment(selectedWeekRange.value.start).add(index, 'days').format('YYYY-MM-DD')

      });

      if(this.activeDays.length == 0) {

        this.weekOptions.splice(this.selectedWeekIndex,1); 

        return this.changeValue({ 'fieldName': 'selectedWeek' });

      }

      this.selectedDay = _.find(this.days,{ 'day': day || this.selectedDay?.day || _.first(this.activeDays) });

      if(moment(this.selectedDay.date).isBefore(moment().format('YYYY-MM-DD'))) {

        this.selectedDay = _.find(this.days,(e)=> moment(e.date).isSame(moment().format('YYYY-MM-DD')) || moment(e.date).isAfter(moment().format('YYYY-MM-DD'))); 

      }

      this.getTimeSlots(this.selectedDay);

    }

    if(fieldName == 'selectedDate') {

      let selectedIndex = _.findIndex(this.weekOptions, { 'label': `${_.cloneDeep(this.selectedDate).startOf('week').subtract(1,'d').format('DD MMM YY')} to ${_.cloneDeep(this.selectedDate).endOf('week').subtract(1,'d').format('DD MMM YY')}` });

      this.selectedWeekIndex = selectedIndex > -1 ? selectedIndex : this.selectedWeekIndex;

      this.changeValue({ 'fieldName': 'selectedWeek', 'day': moment(this.selectedDate).format('dddd') });

    }

  }

  submit() {

    this.isLoading = true;

    let payload: any = _.cloneDeep(this.timeslotForm.value);

    payload = _.map(payload['timeSlots'],(item)=>{

      item["date"] = payload['date'];

      item['startTime'] = {
        
        "hour": moment(item['startTime'],'HH:mm').format('HH'),

        "minute": moment(item['startTime'],'HH:mm').format('mm')

      };

      item['endTime'] = {
        
        "hour": moment(item['endTime'],'HH:mm').format('HH'),

        "minute": moment(item['endTime'],'HH:mm').format('mm')

      };

      return item;

    });

    this.service.patchService({ 'url': `/setup/timeslot`, 'payload': payload }).subscribe((res: any)=>{

      this.isLoading = false;

      if(res.status == 'ok') {

        this.getTimeSlots(this.selectedDay);

        this.service.showToastr({ 'data': { 'message': 'Timeslot updated successfully', 'type': 'success' } });

      }
      
    },(err: any)=>{
      
      this.isLoading = false;

    });

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.userSubscribe.unsubscribe();
  }

}