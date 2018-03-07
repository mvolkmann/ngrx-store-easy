import {
  Component,
  EventEmitter,
  Input,
  NgModule,
  OnInit,
  Output
} from '@angular/core';

import {addReducer, StateService} from './state.service';

@Component({
  selector: 'redux-input',
  template: `
    <input
      [type]="type"
      [(ngModel)]="value"
      (keypress)="onKeyPress($event)"
      (keyup)="onChange($event)"
      (change)="onChange($event)"
    >
  `
})
export class ReduxInputComponent implements OnInit {
  @Input() autofocus: boolean;
  @Input() path: string;
  @Input() type = 'text';
  @Output() enter = new EventEmitter();
  value = '';

  constructor(private stateSvc: StateService) {}

  ngOnInit() {
    this.stateSvc.watch(this, {value: this.path});
  }

  onChange(event) {
    const {checked, value} = event.target;
    const {path, type} = this;

    let v = value;
    if (type === 'checkbox') {
      v = checked;
    } else if (type === 'number' || type === 'range') {
      if (value.length) v = Number(value);
    }

    this.stateSvc.dispatchSet(path, v);

    //TODO: Support custom change handling.
    //if (onChange) onChange(event);
  }

  onKeyPress(event) {
    if (event.key === 'Enter') this.enter.emit();
  }
}
