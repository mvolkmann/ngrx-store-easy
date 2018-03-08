// NSE stands for "ngrx/store Easy"

import {NgModule} from '@angular/core';

// Need this to use ngModel.
import {FormsModule} from '@angular/forms';

// Need this to use *ngFor.
import {BrowserModule} from '@angular/platform-browser';

import {ActionReducerMap, StoreModule} from '@ngrx/store';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';

import {environment} from '../environments/environment';

import {CheckboxesComponent} from './checkboxes.component';
import {InputComponent} from './input.component';
import {RadioButtonsComponent} from './radio-buttons.component';
import {SelectComponent} from './select.component';
import {metaReducers, StateService} from './state.service';
import {TextAreaComponent} from './textarea.component';

const reducerMap: ActionReducerMap<any> = {};
const store = StoreModule.forRoot(reducerMap, {
  initialState: {},
  metaReducers
});

const storeDevTools = StoreDevtoolsModule.instrument({
  logOnly: environment.production,
  maxAge: 25 // # of states to retain
});

@NgModule({
  declarations: [
    CheckboxesComponent,
    InputComponent,
    RadioButtonsComponent,
    SelectComponent,
    TextAreaComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    store,
    storeDevTools
  ],
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
