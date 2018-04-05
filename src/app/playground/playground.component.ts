import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Store, select} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';
import {AppState} from '../../model';

@Component({
  selector: 'app-playground',
  template: `
    <div class="playground">
      <div>name = {{name$ | async}}</div>
      <div>age = {{age$ | async}}</div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
// This doesn't need to extend HasChangeDetector
// because it only watches primitive properties.
export class PlaygroundComponent {
  age$: Observable<number>;
  name$: Observable<string>;

  constructor(private store: Store<AppState>) {
    this.age$ = store.select('person', 'age');
    this.name$ = store.select('person', 'name');
  }
}
