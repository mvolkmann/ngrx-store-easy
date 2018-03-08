import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <app-person-form></app-person-form>
    <app-hello-display></app-hello-display>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
}
