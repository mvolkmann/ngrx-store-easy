import {Action} from '@ngrx/store';

export interface ActionWithPayload extends Action {
  payload: any;
}

export interface Person {
  age: number;
  colors: string[];
  comments: string;
  direction: string;
  employed: boolean;
  evening: boolean;
  morning: boolean;
  name: string;
}

export interface AppState {
  newColor: string;
  person: Person;
}
