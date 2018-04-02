import {Component, Input, OnInit, Output} from '@angular/core';

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

  constructor(private stateSvc: StateService) {}

  ngOnInit() {
    this.stateSvc.watch(this, {value: this.path});
  }

  onChange(event) {
    this.stateSvc.dispatchSet(this.path, '', event.target.value);
  }
}
