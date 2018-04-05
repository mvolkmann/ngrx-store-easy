import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Output
} from '@angular/core';

import {HasChangeDetector, StateService} from './state.service';

@Component({
  selector: 'nse-textarea',
  template: `
    <textarea
      class="nse-textarea"
      [(ngModel)]="value"
      (change)="onChange($event)"
      (keyup)="onChange($event)"
    ></textarea>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextAreaComponent extends HasChangeDetector implements OnInit {
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
