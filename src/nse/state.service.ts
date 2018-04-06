import {ChangeDetectorRef, Injectable} from '@angular/core';
import {ActionReducerMap, State, Store, StoreModule, select} from '@ngrx/store';
import {throttle} from 'lodash/function';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';

interface Action {
  type: string;
  payload?: any;
}
type StateType = Object;

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

export class CaptureType<T> {
  constructor(value: T) {}
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

  markForCheck(): void {
    this.cd.markForCheck();
  }
}

// ng-packagr doesn't allow use of an anonymous function here.
//const metaReducers = [() => reducer];
export function getReducer() {
  return reducer;
}
export const metaReducers = [getReducer];

export type ReducerFn = (state: StateType, payload?: any) => StateType;

function deepFreeze(obj: Object, freezing: Object[] = []): void {
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

function deletePath(state: StateType, payload: any): StateType {
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

function filterPath(state: StateType, payload: any): StateType {
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

function handleError(message: string): void {
  const err = 'ngrx-store-easy error: ' + message;
  console.error(err);
  //throw new Error(err);
}

function initState(state: StateType, payload: StateType): StateType {
  return payload;
}

/**
 * This is called on app startup and
 * again each time the browser window is refreshed.
 */
export function loadState(): StateType {
  const {sessionStorage} = window; // not available in tests

  try {
    const json = sessionStorage ? sessionStorage.getItem(STATE_KEY) : null;
    return json ? JSON.parse(json) : initialState;
  } catch (e) {
    handleError(e.message);
    return initialState;
  }
}

function mapPath(state: StateType, payload: any): StateType {
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

function pushPath(state: StateType, payload: any): StateType {
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

export function reducer(
  state: StateType = initialState,
  action: Action
): StateType {
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

function saveState(state: StateType): void {
  try {
    const json = JSON.stringify(state);
    sessionStorage.setItem(STATE_KEY, json);
  } catch (e) {
    handleError(e.message);
  }
}

function setPath(state: StateType, payload: any): StateType {
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

function transformPath(state: StateType, payload: any): StateType {
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

@Injectable()
export class StateService {
  initialState = {};

  constructor(
    private state: State<StateType>,
    private store: Store<StateType>
  ) {
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
  dispatchDelete(path): void {
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
    type: CaptureType<T>,
    filterFn: (value: T) => boolean
  ): void {
    this.dispatch(FILTER + ' ' + path, {path, value: filterFn});
  }

  /**
   * This updates elements in the array at path.
   * mapFn must be a function that takes an array element
   * and returns new value for the element.
   */
  dispatchMap<T>(
    path: string,
    type: CaptureType<T>,
    mapFn: (value: T) => T
  ): void {
    this.dispatch(MAP + ' ' + path, {path, value: mapFn});
  }

  /**
   * This adds elements to the end of the array at path.
   */
  dispatchPush<T>(path, type: CaptureType<T>, ...elements: T[]): void {
    this.dispatch(PUSH + ' ' + path, {path, value: elements});
  }

  /**
   * Dispatches a Redux action that sets
   * the value found at path to a given value.
   */
  dispatchSet<T>(path: string, type: CaptureType<T>, value: T): void {
    this.dispatch(SET + ' ' + path, {path, value});
  }

  dispatchTransform<T>(
    path: string,
    type: CaptureType<T>,
    value: (value: T) => T
  ): void {
    this.dispatch(TRANSFORM + ' ' + path, {path, value});
  }

  getObservable(path): Observable<any> {
    const {store} = this;
    const parts = path.split('.');
    return store.select.apply(store, parts);
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

  getState(): StateType {
    return this.state.getValue();
  }

  handleAsyncAction(promise): void {
    promise
      .then(newState => this.dispatch('@@async', newState))
      .catch(handleError);
  }

  initial(path: string): any {
    return this.getPathValue(path, initialState);
  }

  setInitialState(state: StateType): void {
    const sessionState = loadState();
    const haveSession = sessionState && Object.keys(sessionState).length > 0;
    initialState = haveSession ? sessionState : state;
    this.dispatch(INIT, initialState);
  }

  watch(path: string, obj: Object, property: string): Subscription {
    if (!obj) throw new Error('watch called with no obj');
    return this.getObservable(path).subscribe(value => {
      obj[property] = value;
      if (obj instanceof HasChangeDetector) obj.markForCheck();
    });
  }
}
