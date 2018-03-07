import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  //templateUrl: './app.component.html',
  template: `
    <app-person-form></app-person-form>
    <app-hello-display></app-hello-display>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
}
