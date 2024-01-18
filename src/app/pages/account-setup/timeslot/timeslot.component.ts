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
  editData: any = {};
  mode: 'Create' | 'Update' = 'Create';
  userSubscribe: any;
  workingDayDetails: Array<any> = [];
  sessionStatus: any = { "AM": false, "PM": false };
  isLoading: boolean = false;
  weekOptions: Array<any> = [];
  selectedWeek: any = 'Default Timeslots';
  loaderUrlList: any = ['/setup/workingHrs/list','/setup/timeslot/list'];

  constructor(public service: CommonService) { 

    this.weekOptions = _.map(Array(30), (val, index) => {

      let start = moment().add(index > 1 ? index-0 : 0, 'weeks').startOf('week');

      let end = moment().add(index > 1 ? index-0 : 0, 'weeks').endOf('week');

      return index == 0 ? 
      
        { 'label': 'Default Timeslots', 'value': null } : 
        
        { 
          'label': index == 1 ? 
          
              'This Week' : 
              
              `${start.format('DD MMM YY')} to ${end.format('DD MMM YY')}`,
        
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
    
    this.service.postService({ 'url': '/setup/workingHrs/list', "payload": { "is_active": true } }).subscribe((res: any) => {

        if(res.status=='ok') {

          this.workingDayDetails = res.data;

          this.activeDays = _.map(this.workingDayDetails, 'day');

          // sort active days based on days array order

          this.activeDays = _.sortBy(this.activeDays, (day: string) => _.findIndex(this.days, { 'day': day }));

          if(_.isEmpty(this.workingDayDetails)) this.service.setApiLoaders({ 'isLoading': false, 'url': ['/setup/timeslot/list'] });

          else this.getTimeSlots(_.find(this.days,{ 'day': _.first(this.activeDays) }));
          
        }

    });

  }

  getTimeSlots(day: any) {

    this.selectedDay = day;

    this.service.postService({ 'url': '/setup/timeslot/list', 'payload': _.pickBy({ 'companyId': this.service.companyDetails._id, ...this.selectedDay }), "options": { "loaderState": true } }).subscribe((res:any)=>{

      this.editData = res?.status == 'ok' ? res.data : {};

      this.availTimeSlots = [];

      // Iterate through each total slot
      for (const slotDet of this.totalTimeSlots) {

        // check if the slot is inbetween any of the shop available times
        const isAvail = _.some(_.find(this.workingDayDetails,{ "day": this.selectedDay.day }).availableTimes, timeDet =>
          moment(slotDet.startTime,"HH:mm").isBetween(moment(timeDet.startTime,"HH:mm"), moment(timeDet.endTime,"HH:mm"), undefined, '[)') &&
          moment(slotDet.endTime,"HH:mm").isBetween(moment(timeDet.startTime,"HH:mm"), moment(timeDet.endTime,"HH:mm"), undefined, '(]')
        );

        // if the slot is available, push it to the available slots array
        if (isAvail) {

          this.availTimeSlots.push({
            'startTime': moment(slotDet.startTime,"HH:mm").format('HH:mm'),
            'endTime': moment(slotDet.endTime,"HH:mm").format('HH:mm'),
            'session': slotDet.session
          });

        }

      }

      this.loadForm();
      
    })

  }

  loadForm() {

    this.timeslotForm = this.service.fb.group({

      "_id": [ !_.isEmpty(this.editData) && (moment(this.editData.date).format("YYYY-MM-DD") == this.selectedDay.date || this.editData.date == this.selectedDay.date) ? this.editData._id : null ],

      "companyId": [ this.service.companyDetails?._id || null ],

      "day": [ this.selectedDay.day, Validators.required ],

      "date": [ this.selectedDay?.date || null ],

      "timeSlots": this.service.fb.array([])

    });

    this.mode = this.f._id.value ? 'Update' : 'Create';

    this.availTimeSlots.forEach((slotDet: any) => {

      slotDet = _.find(this.editData?.timeSlots, { 'startTime': slotDet.startTime, 'endTime': slotDet.endTime }) || slotDet;

      slotDet['label'] = `${moment(slotDet.startTime,'HH:mm').format('hh:mm A')} - ${moment(slotDet.endTime,'HH:mm').format('hh:mm A')}`;

      this.ts.push(this.getTimeSlotForm({ slotDet }));

    });

    this.sessionStatus = { "AM": !_.isEmpty(_.find(this.availTimeSlots,{ 'session': 'AM' })), "PM": !_.isEmpty(_.find(this.availTimeSlots,{ 'session': 'PM' })) };

  }

  get f(): any { return this.timeslotForm.controls; }

  get ts(): any { return this.f.timeSlots as FormArray; }

  getLabel(label: any): string {

    return label.replace(/\b(?:AM|PM)\b/g, '');

  }

  checkIsActiveHour(startTime: any): string {

    return this.selectedDay.date == moment().format("YYYY-MM-DD") ? moment(startTime,'HH:mm').isAfter(moment()) ? 'active' : 'Inactive' : 'active';

  }

  getTimeSlotForm({ slotDet = {} }: { slotDet?: any }) {

    return this.service.fb.group({

      "_id": slotDet._id || null,

      "startTime": slotDet.startTime || '',

      "endTime": slotDet.endTime || '',

      "label": slotDet.label || "",

      "is_active": _.isBoolean(slotDet.is_active) ? slotDet.is_active : false,

      "session": slotDet.session || moment(slotDet.startTime, 'HH:mm').format('A')

    });

  }

  changeValue({ fieldName = "" }: { fieldName: string }) {

    if(fieldName == 'selectedWeek') {

      let selectedWeekRange = _.find(this.weekOptions,{ 'label': this.selectedWeek });

      this.activeDays = _.map(this.workingDayDetails, 'day');

      // sort active days based on days array order

      this.activeDays = _.sortBy(this.activeDays, (day: string) => _.findIndex(this.days, { 'day': day }));

      if(selectedWeekRange.label !== 'Default Timeslots') {
        
        _.map(Array(7), (value: any,index: number) => {
      
          this.days[index]['date'] = moment(selectedWeekRange.value.start).add(index, 'days').format('YYYY-MM-DD');

          if(moment(this.days[index]['date']).isBefore(moment().format('YYYY-MM-DD'))) {

            this.activeDays = _.without(this.activeDays, this.days[index]['day']);

          }
        
          return moment(selectedWeekRange.value.start).add(index, 'days').format('YYYY-MM-DD')

        });

      } else {

        _.map(this.days, (day: any) => day['date'] = null);

      }

      this.selectedDay = _.find(this.days,{ 'day': _.first(this.activeDays) });

      this.getTimeSlots(this.selectedDay);

    }

  }

  submit() {

    this.isLoading = true;

    let payload: any = _.cloneDeep(this.timeslotForm.value);

    payload['timeSlots'] = _.map(payload['timeSlots'], (slotDet: any) => _.omit(slotDet, _.isNull(slotDet._id) ? ['_id'] : []));

    forkJoin({

      'result': this.mode == 'Create' ?

        this.service.postService({ 'url': '/setup/timeslot', 'payload': _.omit(payload,'_id') }) :

        this.service.patchService({ 'url': `/setup/timeslot/${payload._id}`, 'payload': payload }),

    }).subscribe({

      next: (res: any) => {

        this.isLoading = false;

        if(this.mode == 'Create') this.getTimeSlots(this.selectedDay);

        if(res.result.status == 'ok') {

          this.service.showToastr({ 'data': { 'message': 'Timeslot updated successfully', 'type': 'success' } });

        }

      },error: (err: any) => {

        this.isLoading = false;

      }

    });

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.userSubscribe.unsubscribe();
  }

}