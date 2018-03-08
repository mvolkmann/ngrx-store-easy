import {Action} from '@ngrx/store';

export interface ActionWithPayload extends Action {
  payload: any;
}

export interface AppState {
  newColor: string;
  person: {
    age: number;
    colors: string[];
    comments: string,
    direction: string;
    employed: boolean;
    evening: boolean;
    morning: boolean;
    name: string;
  };
}
