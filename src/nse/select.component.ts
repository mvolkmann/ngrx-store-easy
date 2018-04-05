import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Output
} from '@angular/core';

import {HasChangeDetector, StateService} from './state.service';

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
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectComponent extends HasChangeDetector implements OnInit {
  @Input() list: TextValue[];
  @Input() path: string;
  @Output() value = '';

  constructor(cd: ChangeDetectorRef, private stateSvc: StateService) {
    super(cd);
  }

  ngOnInit() {
    this.stateSvc.watch(this.path, this, 'value');
  }

  onChange(event) {
    this.stateSvc.dispatchSet(this.path, '', event.target.value);
  }
}
