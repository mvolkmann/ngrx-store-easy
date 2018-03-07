import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ActionReducerMap, StoreModule} from '@ngrx/store';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';

import {AppComponent} from './app.component';
import {AppState} from './app.model';
import {environment} from '../environments/environment';
import {HelloDisplayComponent} from './hello-display/hello-display.component';
import {PersonFormComponent} from './person-form/person-form.component';
import {initialState} from './initial-state';
import {ReduxCheckboxesComponent} from './redux-checkboxes.component';
import {ReduxInputComponent} from './redux-input.component';
import {ReduxRadioButtonsComponent} from './redux-radio-buttons.component';
import {reducer} from './state.service';
import {StateService} from './state.service';

// This is just used to make TypeScript happy.
// TODO: Can this be avoided somehow?
const reducerMap: ActionReducerMap<AppState> = {
  newColor: null,
  person: null
};

// This allows us to use one reducer function
// for all actions.
const metaReducers = [() => reducer];

@NgModule({
  declarations: [
    AppComponent,
    PersonFormComponent,
    HelloDisplayComponent,
    ReduxCheckboxesComponent,
    ReduxInputComponent,
    ReduxRadioButtonsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    StoreModule.forRoot(
      reducerMap,
      {initialState, metaReducers}),
    StoreDevtoolsModule.instrument({
      logOnly: environment.production,
      maxAge: 25 // # of states to retain
    })
  ],
  providers: [StateService],
  bootstrap: [AppComponent]
})
export class AppModule {}
