import {Component} from '@angular/core';

import {StateService} from '../state.service';

@Component({
  selector: 'app-hello-display',
  template: `
    <div *ngIf="person.name">
      Hello, {{person.name}}!
    </div>
    <div>JSON is {{person | json}}</div>
  `,
  styleUrls: ['./hello-display.component.css']
})
export class HelloDisplayComponent {
  person = {};

  constructor(private stateSvc: StateService) {
    stateSvc.watch(this, {person: ''});
  }
}
