import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {environment} from '../environments/environment';
import {HelloDisplayComponent} from './hello-display/hello-display.component';
import {PersonFormComponent} from './person-form/person-form.component';

import {NseModule} from '../nse/nse.module';

@NgModule({
  declarations: [
    AppComponent,
    PersonFormComponent,
    HelloDisplayComponent,
  ],
  imports: [BrowserModule, FormsModule, NseModule],
  bootstrap: [AppComponent]
})
export class AppModule {}
