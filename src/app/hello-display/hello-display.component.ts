import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component
} from '@angular/core';

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
export class HelloDisplayComponent extends HasChangeDetector {
  person = {};

  constructor(cd: ChangeDetectorRef, private stateSvc: StateService) {
    super(cd);
    stateSvc.watch(this, {person: ''});
  }
}
