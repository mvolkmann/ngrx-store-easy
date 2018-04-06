import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component
} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/observable';

import {
  ageType,
  directionType,
  eveningType,
  morningType,
  newColorType
} from '../initial-state';
import {AppState} from '../model';
import {
  CaptureType,
  HasChangeDetector,
  StateService
} from '../../nse/state.service';
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
    const color: string = this.stateSvc.getPathValue('newColor');
    const colors: string[] = this.stateSvc.getPathValue('person.colors');
    if (!colors.includes(color)) {
      this.stateSvc.dispatchPush('person.colors', newColorType, color);
    }
    const path = 'newColor';
    this.stateSvc.dispatchSet(path, newColorType, '');
  }

  deleteColor(color: string) {
    const path = 'person.colors';
    this.stateSvc.dispatchFilter(
      path,
      directionType,
      (c: string) => c !== color
    );
  }

  pickEvening() {
    const path = 'person.evening';
    this.stateSvc.dispatchSet(path, eveningType, true);
  }

  pickIdle() {
    const path = 'person.direction';
    this.stateSvc.dispatchSet(path, directionType, '2');
  }
}
