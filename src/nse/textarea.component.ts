import {Component, Input, OnInit, Output} from '@angular/core';
import {Store} from '@ngrx/store';

import {StateService} from './state.service';

@Component({
  selector: 'nse-textarea',
  template: `
    <textarea
      class="nse-textarea"
      [(ngModel)]="value"
      (change)="onChange($event)"
      (keyup)="onChange($event)"
    ></textarea>
  `
})
export class TextAreaComponent implements OnInit {
  @Input() path: string;
  @Output() value = '';

  constructor(private stateSvc: StateService, private store: Store<any>) {}

  ngOnInit() {
    this.stateSvc.watch(this.path, this, 'value');
  }

  onChange(event) {
    this.stateSvc.dispatchSet(this.path, '', event.target.value);
  }
}
