import {Component} from '@angular/core';

import {AppState} from '../app.model';
import {addReducer, StateService} from '../state.service';
import {TextPath} from '../redux-checkboxes.component';
import {TextValue} from '../redux-radio-buttons.component';

addReducer('shout', (state: AppState) => {
  const {person} = state;
  const {name} = person;
  return {
    ...state,
    person: {
      ...person,
      name: name.toUpperCase()
    }
  };
});

@Component({
  selector: 'app-person-form',
  templateUrl: './person-form.component.html',
  styleUrls: ['./person-form.component.css']
})
export class PersonFormComponent {
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

  constructor(private stateSvc: StateService) {
    stateSvc.watch(this, {colors: 'person.colors'});
  }

  addColor() {
    const color = this.stateSvc.getPathValue('newColor');
    if (!this.colors.includes(color)) {
      this.stateSvc.dispatchPush('person.colors', color);
    }
    this.stateSvc.dispatchSet('newColor', '');
  }

  deleteColor(color: string) {
    this.stateSvc.dispatchFilter('person.colors', c => c !== color);
  }

  pickEvening() {
    this.stateSvc.dispatchSet('person.evening', true);
  }

  pickIdle() {
    this.stateSvc.dispatchSet('person.direction', "2");
  }
}
