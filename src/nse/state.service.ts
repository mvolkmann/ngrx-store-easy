import {ChangeDetectorRef, Injectable} from '@angular/core';
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
    handleError(`dispatchFilter can only be used on arrays and ${path} is not`);
  }

  const filterFn = value;
  obj[lastPart] = currentValue.filter(filterFn);

  return newState;
}

function handleError(message: string) {
  const err = 'ngrx-store-easy error: ' + message;
  console.error(err);
  //throw new Error(err);
}

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
    handleError(e.message);
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
      `dispatchMap can only be used on arrays and ${path} is not`
    );
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
    handleError('action object passed to reducer must have type property');
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
    handleError(`no reducer found for action type "${type}"`);
  }

  const newState = fn(state, action.payload) || state;

  if (newState instanceof Promise) {
    this.handleAsyncAction(newState);
    return state;
  }

  deepFreeze(newState);
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
    handleError(e.message);
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
      throttle(() => saveState(this.getState()), 1000, {leading: false})
    );
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
  dispatchFilter<T>(
    path: string,
    sampleValue: T,
    filterFn: (value: T) => boolean
  ): void {
    if (typeof filterFn !== 'function') {
      handleError('dispatchFilter must be passed a function');
    }

    this.dispatch(FILTER + ' ' + path, {path, value: filterFn});
  }

  /**
   * This updates elements in the array at path.
   * mapFn must be a function that takes an array element
   * and returns new value for the element.
   */
  dispatchMap<T>(path: string, sampleValue: T, mapFn: (value: T) => T): void {
    if (typeof mapFn !== 'function') {
      throw new Error('dispatchMap must be passed a function');
    }

    this.dispatch(MAP + ' ' + path, {path, value: mapFn});
  }

  /**
   * This adds elements to the end of the array at path.
   */
  dispatchPush<T>(path, sampleValue: T, ...elements: T[]): void {
    this.dispatch(PUSH + ' ' + path, {path, value: elements});
  }

  /**
   * Dispatches a Redux action that sets
   * the value found at path to a given value.
   */
  dispatchSet<T>(path: string, sampleValue: T, value: T): void {
    this.dispatch(SET + ' ' + path, {path, value});
  }

  dispatchTransform<T>(path: string, sampleValue: T, value: (value: T) => T) {
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

  handleAsyncAction(promise) {
    promise
      .then(newState => this.dispatch('@@async', newState))
      .catch(handleError);
  }

  setInitialState(state): void {
    const sessionState = loadState();
    const haveSession = sessionState && Object.keys(sessionState).length > 0;
    initialState = haveSession ? sessionState : state;
    this.dispatch(INIT, initialState);
  }

  subscribe(path, callback): void {
    // Get an observable to the path within the state.
    const obs$ = this.store.select(state => this.getPathValue(path, state));

    obs$.subscribe(value => callback(value));
  }

  watch(path, obj, property) {
    const {store} = this;
    const parts = path.split('.');
    const obs$ = store.select.apply(store, parts);
    obs$.subscribe(value => {
      obj[property] = value;
      if (obj instanceof HasChangeDetector) obj.markForCheck();

    });
  }
}

/**
 * Components that set changeDetection to ChangeDetectionStrategy.OnPush should
 * 1) extend this class
 * 2) inject ChangeDetectorRef into their constructor
 * 3) pass it to super
 * For example,
 * export class Demo extends HasChangeDetector {
 *   constructor(cd: ChangeDetectorRef, private stateSvc: StateService) {
 *     super(cd);
 *     ...
 *   }
 * }
 */
export class HasChangeDetector {
  constructor(private cd: ChangeDetectorRef) {}

  markForCheck() {
    this.cd.markForCheck();
  }
}
