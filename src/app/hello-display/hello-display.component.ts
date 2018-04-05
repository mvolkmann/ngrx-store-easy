import {createSelector, Store} from '@ngrx/store';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy
} from '@angular/core';
import {Observable} from 'rxjs/observable';
import {Subscription} from 'rxjs/subscription';

import {AppState, Person} from '../../model';

import {HasChangeDetector, StateService} from '../../nse/state.service';

@Component({
  selector: 'app-hello-display',
  template: `
    <div *ngIf="person.name" class="greet">
      Hello, {{person.name}}!
    </div>
    <pre class="json">JSON is {{person | json}}</pre>
  `,
  styleUrls: ['./hello-display.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HelloDisplayComponent extends HasChangeDetector
  implements OnDestroy {
  person: Person;
  subscription: Subscription;

  constructor(
    cd: ChangeDetectorRef,
    stateSvc: StateService,
    store: Store<AppState>
  ) {
    super(cd);

    this.subscription = stateSvc.watch('person', this, 'person');

    /*
    const getPerson = (state: AppState) => state.person;
    const selector = createSelector(getPerson, person => person);
    this.subscription = store
      .select(selector)
      .subscribe(person => {
        this.person = person;
        cd.markForCheck();
      });
    */
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
