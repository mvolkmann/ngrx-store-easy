import {AppState} from './model';
import {CaptureType} from '../nse/state.service';

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

const {person} = initialState;
export const ageType = new CaptureType(person.age);
export const colorsType = new CaptureType(person.colors);
export const commentsType = new CaptureType(person.comments);
export const directionType = new CaptureType(person.direction);
export const employedType = new CaptureType(person.employed);
export const eveningType = new CaptureType(person.evening);
export const morningType = new CaptureType(person.morning);
export const nameType = new CaptureType(person.name);
export const newColorType = new CaptureType(initialState.newColor);
export const personType = new CaptureType(person);
