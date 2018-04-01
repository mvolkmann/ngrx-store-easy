import {Injectable} from '@angular/core';
import {ActionReducerMap, State, Store, StoreModule, select} from '@ngrx/store';
import {throttle} from 'lodash/function';

const DELETE = '@@delete';
const FILTER = '@@filter';
const INIT = '@@init';
const MAP = '@@map';
const PATH_DELIMITER = '.';
const PUSH = '@@push';
const SET = '@@set';
const TRANSFORM = '@@transform';
const STATE_KEY = 'reduxState';

const reducers = {
  '@ngrx/store/init': () => null,
  '@@redux/INIT': () => null,
  '@@async': (state, payload) => payload,
  [DELETE]: deletePath,
  [FILTER]: filterPath,
  [INIT]: initState,
  [MAP]: mapPath,
  [PUSH]: pushPath,
  [SET]: setPath,
  [TRANSFORM]: transformPath
};

let initialState = {};

// ng-packagr doesn't allow use of an anonymous function here.
//const metaReducers = [() => reducer];
export function getReducer() {
  return reducer;
}
export const metaReducers = [getReducer];

export type ReducerFn = (state: Object, payload?: any) => Object;

type TransformFn = <T>(value: T) => T;

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

function deletePath(state, payload) {
  const path = payload;
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

  delete obj[lastPart];

  return newState;
}

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
    type.startsWith(TRANSFORM) ||
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

function transformPath(state, payload) {
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

  const fn = value;
  const currentValue = obj[lastPart];
  obj[lastPart] = fn(currentValue);

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
  * This deletes the property at path.
  */
  dispatchDelete(path) {
    this.dispatch(DELETE + ' ' + path, path);
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

  dispatchTransform(path: string, value: TransformFn) {
    this.dispatch(TRANSFORM + ' ' + path, {path, value});
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
    const haveSession = sessionState && Object.keys(sessionState).length > 0;
    initialState = haveSession ? sessionState : state;
    this.dispatch(INIT, initialState);
  }

  subscribe(path, callback): void {
    // Get an observable to the path within the state.
    // This works.  Components looking at the same path do get updated.
    const obs$ = this.store.select(state => this.getPathValue(path, state));
    // This does not work.  Components looking at the same path don't get updated.
    //const obs$ = this.store.pipe(select(path));

    obs$.subscribe(value => callback(value));
  }

  watch(obj: Object, propToPathMap: PropToPathMap): void {
    Object.keys(propToPathMap).forEach(prop => {
      // Path defaults to same as prop if not set.
      const path = propToPathMap[prop] || prop;
      //this.subscribe(path, v => (obj[prop] = v));
      this.subscribe(path, v => {
        console.log('state.service.ts watch:', prop, 'changed to', v, 'in', obj);
        obj[prop] = v;
        const cd = obj['cd'];
        console.log('state.service.ts watch: cd =', cd);
        if (cd) cd.markForCheck();
      });
    });
  }
}
