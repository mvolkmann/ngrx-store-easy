import {Component, Input, NgModule, OnInit, Output} from '@angular/core';

import {StateService} from './state.service';

export interface TextPath {
  text: string;
  path: string;
}

/**
 * This component renders a set of checkboxes.
 * The `list` prop specifies the text and Redux state path
 * for each checkbox.
 * Specify a `className` prop to enable styling the checkboxes.
 */
@Component({
  selector: 'nse-checkboxes',
  template: `
    <div className="{{'nse-checkboxes ' + className}}">
      <div *ngFor="let obj of list; let i = index" class="item">
        <input
          [checked]="values[i]"
          [class]="getName(i)"
          (change)="onChange($event, obj.path)"
          type="checkbox"
        >
        <label>{{obj.text}}</label>
      </div>
    </div>
  `
})
export class CheckboxesComponent implements OnInit {
  @Input() className = '';
  @Input() list: TextPath[];
  @Input() values = [];

  constructor(private stateSvc: StateService) {}

  ngOnInit() {
    this.list.forEach((obj, index) =>
      this.stateSvc.subscribe(obj.path, value => (this.values[index] = value))
    );
  }

  getName(index) {
    return 'rb' + (index + 1);
  }

  onChange(event, path) {
    this.stateSvc.dispatchSet(path, event.target.checked);
  }
}
