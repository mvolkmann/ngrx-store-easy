import {Component, Input, OnInit, Output} from '@angular/core';
import {Store} from '@ngrx/store';

import {StateService} from './state.service';

export interface TextValue {
  text: string;
  value: string | number;
}

@Component({
  selector: 'nse-select',
  template: `
    <select
      class="nse-select"
      [(ngModel)]="value"
      (change)="onChange($event)"
    >
      <option
        *ngFor="let obj of list; let i = index"
        [value]="obj.value"
      >
        {{obj.text}}
      </option>
    </select>
  `
})
export class SelectComponent implements OnInit {
  @Input() list: TextValue[];
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
