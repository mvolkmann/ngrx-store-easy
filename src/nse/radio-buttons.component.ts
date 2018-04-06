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
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadioButtonsComponent extends HasChangeDetector implements OnInit {
  @Input() className = '';
  @Input() list: TextValue[];
  @Input() path = '';
  @Input() value = 0;

  constructor(cd: ChangeDetectorRef, private stateSvc: StateService) {
    super(cd);
  }

  ngOnInit() {
    this.stateSvc.watch(this.path, this, 'value');
  }

  getName(index) {
    return 'rb' + (index + 1);
  }

  onChange(event) {
    // We don't need to use a CaptureType here because the
    // RadioButtons component should only used with boolean properties.
    this.stateSvc.dispatchSet(this.path, null, event.target.value);
  }
}
