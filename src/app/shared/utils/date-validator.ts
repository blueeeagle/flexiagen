import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import * as moment from 'moment';

/** A hero's name can't match the given regular expression */
export function DateValidator({ date = moment().format("yyyy-MM-DD"), condition = "min" }: {date: any, condition?: "min" | "max" }): ValidatorFn {

    return (control: AbstractControl): ValidationErrors | null => {

      const invalid = condition == 'max' ? Date.parse(date) < Date.parse(control.value) : Date.parse(date) > Date.parse(control.value);

      return invalid ? { invalidDate : { value: control.value } } : null;

    };

  }