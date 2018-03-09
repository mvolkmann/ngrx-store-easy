import {Injectable} from '@angular/core';
import {ActionReducerMap, State, Store, StoreModule, select} from '@ngrx/store';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {throttle} from 'lodash/function';

export const FILTER = '@@filter';
export const INIT = '@@init';
export const MAP = '@@map';
export const PATH_DELIMITER = '.';
export const PUSH = '@@push';
export const SET = '@@set';
const STATE_KEY = 'reduxState';

const reducers = {
  '@ngrx/store/init': () => null,
  '@@redux/INIT': () => null,
  '@@async': (state, payload) => payload,
  [FILTER]: filterPath,
  [INIT]: initState,
  [MAP]: mapPath,
  [PUSH]: pushPath,
  [SET]: setPath
};

let initialState = {};

// ng-packagr doesn't allow use of an anonymous function here.
//const metaReducers = [() => reducer];
export function getReducer() {
  return reducer;
}
export const metaReducers = [getReducer];

export type ReducerFn = (state: Object, payload?: any) => Object;

/*
function deepFreeze(obj: Object, freezing: Object[] = []) {
  //TODO: When running "npm run package" it complains
  //TODO: that includes does not exist on Object[].  Wha?
  if (Object.isFrozen(obj) || freezing.includes(obj)) return;

  freezing.push(obj);

  const props = Object.getOwnPropertyNames(obj);
  for (const prop of props) {
    const value = obj[prop];
    if (typeof value === 'object' && value !== null) {
      deepFreeze(value, freezing);
    }
  }

  Object.freeze(obj);
}
*/

function error(message: string) {
  const err = 'ngrx-store-easy error: ' + message;
  console.error(err);
  //throw new Error(err);
}

function filterPath(state, payload) {
  const {path, value} = payload;
  const parts = path.split(PATH_DELIMITER);
  const lastPart = parts.pop();
  const newState = {...state};

  let obj = newState;
  for (const part of parts) {
    const v = obj[part];
    const newV = {...v};
    obj[part] = newV;
    obj = newV;
  }

  const currentValue = obj[lastPart];
  if (!Array.isArray(currentValue)) {
    error(
      `dispatchFilter can only be used on arrays and ${path} is not`
    );
  }

  const filterFn = value;
  obj[lastPart] = currentValue.filter(filterFn);

  return newState;
}

/*
function handleAsyncAction(promise) {
  promise
    .then(newState => dispatch('@@async', newState))
    .catch(error => console.trace(error));
}
*/

function initState(state, payload) {
  return payload;
}

/**
 * This is called on app startup and
 * again each time the browser window is refreshed.
 */
export function loadState() {
  const {sessionStorage} = window; // not available in tests

  try {
    const json = sessionStorage ? sessionStorage.getItem(STATE_KEY) : null;
    return json ? JSON.parse(json) : initialState;
  } catch (e) {
    error(e.message);
    return initialState;
  }
}

function mapPath(state, payload) {
  const {path, value} = payload;
  const parts = path.split(PATH_DELIMITER);
  const lastPart = parts.pop();
  const newState = {...state};

  let obj = newState;
  for (const part of parts) {
    const v = obj[part];
    const newV = {...v};
    obj[part] = newV;
    obj = newV;
  }

  const currentValue = obj[lastPart];
  if (!Array.isArray(currentValue)) {
    throw new Error(
      `dispatchMap can only be used on arrays and ${path} is not`);
  }

  const mapFn = value;
  obj[lastPart] = currentValue.map(mapFn);

  return newState;
}

function pushPath(state, payload) {
  const {path, value} = payload;
  const parts = path.split(PATH_DELIMITER);
  const lastPart = parts.pop();
  const newState = {...state};

  let obj = newState;
  for (const part of parts) {
    const v = obj[part];
    const newV = {...v};
    obj[part] = newV;
    obj = newV;
  }

  let currentValue = obj[lastPart];
  if (!Array.isArray(currentValue)) currentValue = [];

  obj[lastPart] = [...currentValue, ...value];

  return newState;
}

export function reducer(state = initialState, action) {
  let {type} = action;
  if (!type) {
    error('action object passed to reducer must have type property');
  }

  if (
    type.startsWith(SET) ||
    type.startsWith(PUSH) ||
    type.startsWith(FILTER) ||
    type.startsWith(MAP)
  ) {
    const index = type.indexOf(' ');
    type = type.substring(0, index);
  }

  const fn = reducers[type];
  if (!fn) {
    error(`no reducer found for action type "${type}"`);
  }

  const newState = fn(state, action.payload) || state;

  if (newState instanceof Promise) {
    //handleAsyncAction(newState);
    return state;
  }

  //deepFreeze(newState);
  return newState;
}

function saveState(state) {
  try {
    // When stringifying errors Set, change to an Array.
    const json = JSON.stringify(
      state,
      (key, value) => (key === 'errors' ? [...state.errors] : value)
    );

    sessionStorage.setItem(STATE_KEY, json);
  } catch (e) {
    error(e.message);
  }
}

function setPath(state, payload) {
  const {path, value} = payload;
  const parts = path.split(PATH_DELIMITER);
  const lastPart = parts.pop();
  const newState = {...state};

  let obj = newState;
  for (const part of parts) {
    const v = obj[part];
    const newV = {...v};
    obj[part] = newV;
    obj = newV;
  }

  obj[lastPart] = value;

  return newState;
}

export interface PropToPathMap {
  [prop: string]: string;
}

@Injectable()
export class StateService {
  constructor(private state: State<Object>, private store: Store<Object>) {
      this.store.subscribe(
        throttle(
          () => saveState(this.getState()),
          1000,
          {leading: false}));
  }

  addReducer(type: string, fn: ReducerFn): void {
    reducers[type] = fn;
  }

  /**
   * Dispatches a Redux action with a given type and payload.
   */
  dispatch(type: string, payload?: any): void {
    this.store.dispatch({type, payload});
  }

  /**
   * This removes elements from the array at path.
   * filterFn must be a function that takes an array element
   * and returns a boolean indicating
   * whether the element should be retained.
   */
  dispatchFilter(path: string, filterFn): void {
    if (typeof filterFn !== 'function') {
      error('dispatchFilter must be passed a function');
    }

    this.dispatch(FILTER + ' ' + path, {path, value: filterFn});
  }

  /**
   * This updates elements in the array at path.
   * mapFn must be a function that takes an array element
   * and returns new value for the element.
   */
  dispatchMap(path: string, mapFn): void {
    if (typeof mapFn !== 'function') {
      throw new Error('dispatchMap must be passed a function');
    }

    this.dispatch(MAP + ' ' + path, {path, value: mapFn});
  }

  /**
   * This adds elements to the end of the array at path.
   */
  dispatchPush(path, ...elements): void {
    this.dispatch(PUSH + ' ' + path, {path, value: elements});
  }

  /**
   * Dispatches a Redux action that sets
   * the value found at path to a given value.
   */
  dispatchSet(path: string, value: any): void {
    this.dispatch(SET + ' ' + path, {path, value});
  }

  getPathValue(path: string, state?: Object): any {
    if (!path) return undefined;

    let value = state || this.getState();
    const parts = path.split(PATH_DELIMITER);
    for (const part of parts) {
      value = value[part];
      if (value === undefined) return value;
    }
    return value;
  }

  getState(): Object {
    return this.state.getValue();
  }

  setInitialState(state): void {
    const sessionState = loadState();
    initialState = sessionState || state;
    this.dispatch(INIT, initialState);
  }

  subscribe(path, callback): void {
    // Get an observable to the path within the state.
    const obs$ = this.store.select(state => this.getPathValue(path, state));

    obs$.subscribe(value => callback(value));
  }

  watch(obj: Object, propToPathMap: PropToPathMap): void {
    Object.keys(propToPathMap).forEach(prop => {
      // Path defaults to same as prop if not set.
      const path = propToPathMap[prop] || prop;
      this.subscribe(path, v => (obj[prop] = v));
    });
  }
}
