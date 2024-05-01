import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function roleValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const validRoles = ['DEVELOPER', 'HR'];
    return validRoles.includes(control.value) ? null : { invalidRole: true };
  };
}
