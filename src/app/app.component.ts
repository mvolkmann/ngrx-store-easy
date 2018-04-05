import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component
} from '@angular/core';
import {StateService} from '../nse/state.service';

import {initialState} from '../initial-state';

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
