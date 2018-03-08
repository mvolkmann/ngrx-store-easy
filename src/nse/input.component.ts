import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import {StateService} from './state.service';

@Component({
  selector: 'nse-input',
  template: `
    <input
      class="nse-input"
      [checked]="checked"
      [type]="type"
      [(ngModel)]="value"
      (change)="onChange($event)"
      (keypress)="onKeyPress($event)"
      (keyup)="onChange($event)"
    >
  `
})
export class InputComponent implements OnInit {
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
