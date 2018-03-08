import {Component} from '@angular/core';

import {StateService} from '../../nse/state.service';

@Component({
  selector: 'app-hello-display',
  template: `
    <div *ngIf="person.name" class="greet">
      Hello, {{person.name}}!
    </div>
    <pre class="json">JSON is {{person | json}}</pre>
  `,
  styleUrls: ['./hello-display.component.css']
})
export class HelloDisplayComponent {
  person = {};

  constructor(private stateSvc: StateService) {
    stateSvc.watch(this, {person: ''});
  }
}
