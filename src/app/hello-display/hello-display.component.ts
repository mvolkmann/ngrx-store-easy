import {Store} from '@ngrx/store';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component
} from '@angular/core';
import {Observable} from 'rxjs/observable';

import {AppState, Person} from '../../model';

import {HasChangeDetector, StateService} from '../../nse/state.service';

@Component({
  selector: 'app-hello-display',
  template: `
    <div *ngIf="(person$ | async).name" class="greet">
      Hello, {{(person$ | async).name}}!
    </div>
    <pre class="json">JSON is {{person$ | async | json}}</pre>
  `,
  styleUrls: ['./hello-display.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HelloDisplayComponent extends HasChangeDetector {
  person$: Observable<Person>;

  constructor(cd: ChangeDetectorRef, store: Store<AppState>) {
    super(cd);
    this.person$ = store.select('person');
  }
}
