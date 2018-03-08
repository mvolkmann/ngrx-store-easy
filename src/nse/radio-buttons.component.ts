import {Component, Input, OnInit, Output} from '@angular/core';

import {StateService} from './state.service';

export interface TextValue {
  text: string;
  value: string | number;
}

/**
 * This component renders a set of radio buttons.
 * The `list` prop specifies the text and value
 * for each radio button.
 * Specify a `className` prop to enable styling the radio buttons.
 */
@Component({
  selector: 'nse-radio-buttons',
  template: `
    <div className="{{'nse-radio-buttons ' + className}}">
      <div *ngFor="let obj of list; let i = index" class="item">
        <input
          [checked]="obj.value == value"
          [class]="getName(i)"
          name="path"
          (change)="onChange($event)"
          type="radio"
          value="{{obj.value}}"
        >
        <label>{{obj.text}}</label>
      </div>
    </div>
  `
})
export class RadioButtonsComponent implements OnInit {
  @Input() className = '';
  @Input() list: TextValue[];
  @Input() path = '';
  @Input() value = 0;

  constructor(private stateSvc: StateService) {}

  ngOnInit() {
    this.stateSvc.watch(this, {value: this.path});
  }

  getName(index) {
    return 'rb' + (index + 1);
  }

  onChange(event) {
    this.stateSvc.dispatchSet(this.path, event.target.value);
  }
}
