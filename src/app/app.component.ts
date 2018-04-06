import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component
} from '@angular/core';
import {createSelector} from '@ngrx/store';

import {initialState} from './initial-state';
import {StateService} from '../nse/state.service';

@Component({
  selector: 'app-root',
  template: `
    <app-person-form></app-person-form>
    <app-hello-display></app-hello-display>
    <app-playground></app-playground>
  `,
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  constructor(private stateSvc: StateService) {
    stateSvc.setInitialState(initialState);
  }
}
