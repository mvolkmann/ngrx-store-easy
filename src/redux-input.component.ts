import {
  Component,
  EventEmitter,
  Input,
  NgModule,
  OnInit,
  Output
} from '@angular/core';

import {StateService} from './state.service';

@Component({
  selector: 'redux-input',
  template: `
    <input
      [checked]="checked"
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

  @Output() checked = false;
  @Output() enter = new EventEmitter();
  @Output() value = '';

  constructor(private stateSvc: StateService) {}

  ngOnInit() {
    this.stateSvc.watch(this, {value: this.path});
    if (this.type === 'checkbox') {
      this.checked = Boolean(this.value);
    }
  }

  onChange(event) {
    const {checked, value} = event.target;
    const {path, type} = this;

    let v = value;
    if (type === 'checkbox') {
      v = checked;
      this.checked = checked;
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
