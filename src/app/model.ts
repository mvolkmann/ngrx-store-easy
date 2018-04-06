import {createSelector} from '@ngrx/store';

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

/*
const makeSelector = fn => createSelector(x => x, fn);

export const personDirectionSelector = makeSelector(
  state => state.person.direction
);
*/
