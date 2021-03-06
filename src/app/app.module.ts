import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {HelloDisplayComponent} from './hello-display/hello-display.component';
import {PersonFormComponent} from './person-form/person-form.component';
import {PlaygroundComponent} from './playground/playground.component';
import {environment} from '../environments/environment';

import {NseModule} from '../nse/nse.module';

@NgModule({
  declarations: [
    AppComponent,
    HelloDisplayComponent,
    PersonFormComponent,
    PlaygroundComponent
  ],
  imports: [BrowserModule, FormsModule, NseModule],
  bootstrap: [AppComponent]
})
export class AppModule {}
