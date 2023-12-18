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
  days: any = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];
  selectedDay: string = 'Sunday';
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
  workingDayDetails: any;
  sessionStatus: any = { "AM": false, "PM": false };
  isLoading: boolean = false;

  loaderUrlList: any = ['/app/workingHrs/list','/app/timeslot/list'];

  constructor(public service: CommonService) { 

    this.service.setApiLoaders({ 'isLoading': true, 'url': this.loaderUrlList });

    this.loadForm();

    if(!_.isEmpty(this.service.companyDetails)) this.getWorkingHours();

    this.userSubscribe = this.service.userDetailsObs.subscribe((data: any) => {

      if(!_.isEmpty(data)) {

        this.getWorkingHours();

      }

    });

  }

  getWorkingHours(){
    
    this.service.postService({ 'url': '/app/workingHrs/list', 'payload': { 'companyId': this.service.companyDetails._id, 'day': this.selectedDay, 'isDefault': true } }).subscribe((res: any) => {

        if(res.status=='ok') {

          this.workingDayDetails = _.first(res.data) || {};

          if(!_.isEmpty(this.workingDayDetails)) this.getTimeSlots();

          else this.service.setApiLoaders({ 'isLoading': false, 'url': ['/app/timeslot/list'] });
          
        }

    });

  }

  getTimeSlots() {

    this.service.postService({ 'url': '/app/timeslot/list', 'payload': { 'companyId': this.service.companyDetails._id, 'day': this.selectedDay, 'isDefault': true } }).subscribe((res:any)=>{

      this.editData = res?.status == 'ok' ? _.first(res.data) : {};

      this.mode = this.editData?._id ? 'Update' : 'Create';

      this.availTimeSlots = [];

      // Iterate through each total slot
      for (const slotDet of this.totalTimeSlots) {

        // check if the slot is inbetween any of the shop available times
        const isAvail = _.some(this.workingDayDetails.availableTimes, timeDet =>
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

      "companyId": [ this.service.companyDetails?._id || '' ],

      "day": [ this.selectedDay, Validators.required ],

      "timeSlots": this.service.fb.array([])

    });

    this.availTimeSlots.forEach((slotDet: any) => {

      slotDet = _.find(this.editData?.timeSlots, { 'startTime': slotDet.startTime, 'endTime': slotDet.endTime }) || slotDet;

      slotDet['label'] = `${moment(slotDet.startTime,'HH:mm').format('hh:mm')} - ${moment(slotDet.endTime,'HH:mm').format('hh:mm')}`;

      this.ts.push(this.getTimeSlotForm({ slotDet }));

    });

    this.sessionStatus = { "AM": !_.isEmpty(_.find(this.availTimeSlots,{ 'session': 'AM' })), "PM": !_.isEmpty(_.find(this.availTimeSlots,{ 'session': 'PM' })) };

  }

  get f(): any { return this.timeslotForm.controls; }

  get ts(): any { return this.f.timeSlots as FormArray; }

  getTimeSlotForm({ slotDet = {} }: { slotDet?: any }) {

    return this.service.fb.group({

      "startTime": slotDet.startTime || '',

      "endTime": slotDet.endTime || '',

      "label": slotDet.label || "",

      "is_active": _.isBoolean(slotDet.is_active) ? slotDet.is_active : true,

      "session": slotDet.session || moment(slotDet.startTime, 'HH:mm').format('A')

    });

  }

  submit() {

    this.isLoading = true;

    let payload: any = _.cloneDeep(this.timeslotForm.value);

    payload['timeSlots'] = _.map(payload['timeSlots'], (slotDet: any) => _.omit(slotDet, ['label']));

    forkJoin({

      'result': this.mode == 'Create' ?

        this.service.postService({ 'url': '/app/timeslot', 'payload': payload }) :

        this.service.patchService({ 'url': `/app/timeslot/${this.editData._id}`, 'payload': payload })

    }).subscribe({

      next: (res: any) => {

        this.isLoading = false;

        if(res.result.status == 'ok') {

          this.service.showToastr({ 'data': { 'message': 'Timeslot updated successfully', 'type': 'success' } });

          this.getWorkingHours();

        }

      },

      error: (err: any) => {

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