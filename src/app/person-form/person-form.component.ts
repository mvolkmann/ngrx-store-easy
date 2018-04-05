import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component
} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/observable';

import {AppState} from '../../model';
import {HasChangeDetector, StateService} from '../../nse/state.service';
import {TextPath} from '../../nse/checkboxes.component';
import {TextValue} from '../../nse/radio-buttons.component';

let stateSvc;
let initial;

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

  colors$: Observable<string[]>;

  directionList: TextValue[] = [
    {text: 'Forward', value: 1},
    {text: 'Idle', value: 2},
    {text: 'Reverse', value: 3}
  ];

  constructor(cd: ChangeDetectorRef, ss: StateService, store: Store<AppState>) {
    super(cd);
    stateSvc = ss;
    initial = stateSvc.initial.bind(stateSvc);
    this.colors$ = store.select('person', 'colors');
  }

  addColor() {
    const color = stateSvc.getPathValue('newColor');
    const colors = stateSvc.getPathValue('person.colors');
    if (!colors.includes(color)) {
      stateSvc.dispatchPush('person.colors', initial('newColor'), color);
    }
    const path = 'newColor';
    stateSvc.dispatchSet(path, initial(path), '');
  }

  deleteColor(color: string) {
    const path = 'person.colors';
    stateSvc.dispatchFilter(path, initial(path), c => c !== color);
  }

  pickEvening() {
    const path = 'person.evening';
    stateSvc.dispatchSet(path, initial(path), true);
  }

  pickIdle() {
    const path = 'person.direction';
    stateSvc.dispatchSet(path, initial(path), '2');
  }
}
