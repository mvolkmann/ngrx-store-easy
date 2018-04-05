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

  constructor(
    cd: ChangeDetectorRef,
    private stateSvc: StateService,
    store: Store<AppState>
  ) {
    super(cd);
    this.colors$ = store.select('person', 'colors');
  }

  addColor() {
    const {stateSvc} = this;
    const color = stateSvc.getPathValue('newColor');
    const colors = stateSvc.getPathValue('person.colors');
    if (!colors.includes(color)) {
      stateSvc.dispatchPush('person.colors', '', color);
    }
    const path = 'newColor';
    const initial = stateSvc.getInitialValue(path);
    stateSvc.dispatchSet(path, initial, '');
  }

  deleteColor(color: string) {
    const {stateSvc} = this;
    const path = 'person.colors';
    const initial = stateSvc.getInitialValue(path);
    stateSvc.dispatchFilter(path, initial, c => c !== color);
  }

  pickEvening() {
    const {stateSvc} = this;
    const path = 'person.evening';
    const initial = stateSvc.getInitialValue(path);
    this.stateSvc.dispatchSet(path, initial, true);
  }

  pickIdle() {
    const {stateSvc} = this;
    const path = 'person.direction';
    const initial = stateSvc.getInitialValue(path);
    stateSvc.dispatchSet(path, initial, '2');
  }
}
