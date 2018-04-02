import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component
} from '@angular/core';

import {HasChangeDetector, StateService} from '../../nse/state.service';
import {TextPath} from '../../nse/checkboxes.component';
import {TextValue} from '../../nse/radio-buttons.component';

@Component({
  selector: 'app-person-form',
  templateUrl: './person-form.component.html',
  styleUrls: ['./person-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonFormComponent extends HasChangeDetector {
  availabilityList: TextPath[] = [
    {text: 'Morning', path: 'person.morning'},
    {text: 'Evening', path: 'person.evening'}
  ];

  colors: string[] = [];

  directionList: TextValue[] = [
    {text: 'Forward', value: 1},
    {text: 'Idle', value: 2},
    {text: 'Reverse', value: 3}
  ];

  constructor(cd: ChangeDetectorRef, private stateSvc: StateService) {
    super(cd);
    stateSvc.watch(this, {colors: 'person.colors'});
  }

  addColor() {
    const color = this.stateSvc.getPathValue('newColor');
    if (!this.colors || !this.colors.includes(color)) {
      this.stateSvc.dispatchPush('person.colors', '', color);
    }
    this.stateSvc.dispatchSet('newColor', '', '');
  }

  deleteColor(color: string) {
    this.stateSvc.dispatchFilter('person.colors', '', c => c !== color);
  }

  pickEvening() {
    this.stateSvc.dispatchSet('person.evening', true, true);
  }

  pickIdle() {
    this.stateSvc.dispatchSet('person.direction', '', '2');
  }
}
