// NSE stands for "ngrx/store Easy"

import {NgModule} from '@angular/core';
// Need this to use ngModel.
import {FormsModule} from '@angular/forms';
// Need this to use *ngFor.
import {BrowserModule} from '@angular/platform-browser';

import {environment} from '../environments/environment';

import {CheckboxesComponent} from './checkboxes.component';
import {InputComponent} from './input.component';
import {RadioButtonsComponent} from './radio-buttons.component';
import {SelectComponent} from './select.component';
import {getImports, StateService} from './state.service';
import {TextAreaComponent} from './textarea.component';

@NgModule({
  declarations: [
    CheckboxesComponent,
    InputComponent,
    RadioButtonsComponent,
    SelectComponent,
    TextAreaComponent
  ],
  imports: [BrowserModule, FormsModule, ...getImports(environment)],
  exports: [
    CheckboxesComponent,
    InputComponent,
    TextAreaComponent,
    RadioButtonsComponent,
    SelectComponent
  ],
  providers: [StateService]
})
export class NseModule {}
