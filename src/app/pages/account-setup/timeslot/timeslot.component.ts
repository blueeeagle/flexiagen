import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { CommonService } from '@shared/services/common/common.service';
import * as moment from 'moment';

@Component({
  selector: 'app-timeslot',
  templateUrl: './timeslot.component.html',
  styleUrls: ['./timeslot.component.scss']
})
export class TimeslotComponent {

  timeslotForm: any;
  days: any = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];
  editData: any = {};
  mode: 'Create' | 'Update' = 'Create';

  constructor(private service: CommonService) { 

    this.loadForm();
    
  }

  loadForm() {

    this.timeslotForm = this.service.fb.group({

      "companyId": [ this.service.companyDetails?._id || '' ],

      "day": [ this.editData.day || 'Sunday', Validators.required ],

      "timeSlots": this.service.fb.array([])

    });

    if(this.mode === 'Update') {

      this.editData.timeSlots.forEach((element: any) => {

        

      });

    } else {

    }

  }

  getTimeSlotForm({ slotDet = {} }: { slotDet?: any }) {

    return this.service.fb.group({

      "startTime": slotDet.startTime || '',

      "endTime": slotDet.endTime || '',

      "is_active": slotDet.is_active || true,

      "session": slotDet.session || moment(slotDet.startTime, 'HH:mm').format('A')

    });

  }

}