import {AppState} from './model';

export const initialState: AppState = {
  newColor: '',
  person: {
    age: 0,
    colors: [],
    comments: '',
    direction: '1',
    employed: false,
    evening: false,
    morning: true,
    name: ''
  }
};
