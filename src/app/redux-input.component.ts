import {Component, Input, NgModule, OnInit} from '@angular/core';

import {addReducer, StateService} from './state.service';

@Component({
  selector: 'redux-input',
  template: `
    <input
      [type]="type"
      [(ngModel)]="value"
      (keyup)="onChange($event)"
      (change)="onChange($event)"
    >
  `
})
export class ReduxInputComponent implements OnInit {
  @Input() autofocus: boolean;
  @Input() path: string;
  @Input() type = 'text';
  value = '';

  constructor(private stateSvc: StateService) {
  }

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

    //if (onChange) onChange(event);
  };

  /*
  TODO: Implement onEnter support!
  render() {
    const {onEnter, path, type = 'text'} = this.props;

    let {value} = this.props;
    if (!value) value = getPathValue(path);

    const isCheckbox = type === 'checkbox';
    if (value === undefined) value = isCheckbox ? false : '';

    const propName = isCheckbox ? 'checked' : 'value';
    const inputProps = {...this.props, [propName]: value};

    if (onEnter) {
      inputProps.onKeyPress = event => {
        if (event.key === 'Enter') onEnter();
      };
      delete inputProps.onEnter;
    }
  }
  */
}
