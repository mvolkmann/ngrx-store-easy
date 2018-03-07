import {AppState} from './app.model';

export const initialState: AppState = {
  newColor: '',
  person: {
    age: 0,
    colors: [],
    direction: "1",
    employed: false,
    evening: false,
    morning: true,
    name: ''
  }
};
