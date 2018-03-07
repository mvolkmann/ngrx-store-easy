import {Injectable} from '@angular/core';
import {State, Store, select} from '@ngrx/store';
import {AppState} from './app.model';
import {initialState} from './initial-state';

const FILTER = '@@filter';
const PATH_DELIMITER = '.';
const PUSH = '@@push';
const SET = '@@set';

const reducers = {
  '@ngrx/store/init': () => null,
  '@@redux/INIT': () => null,
  '@@async': (state, payload) => payload,
  [FILTER]: filterPath,
  [PUSH]: pushPath,
  [SET]: setPath
};

type ReducerFn = (state: Object, payload?: any) => Object;

type PropToPathMap = {[prop: string]: string};

export const addReducer = (type: string, fn: ReducerFn) =>
  (reducers[type] = fn);

function deepFreeze(obj, freezing = []) {
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
    throw new Error(
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

  const currentValue = obj[lastPart];
  if (!Array.isArray(currentValue)) {
    throw new Error(
      `dispatchPush can only be used on arrays and ${path} is not`
    );
  }

  obj[lastPart] = [...currentValue, ...value];

  return newState;
}

export function reducer(state = initialState, action) {
  let {type} = action;
  if (!type) {
    throw new Error('action object passed to reducer must have type property');
  }

  if (
    type.startsWith(SET) ||
    type.startsWith(PUSH) ||
    type.startsWith(FILTER)
  ) {
    const index = type.indexOf(' ');
    type = type.substring(0, index);
  }

  const fn = reducers[type];
  if (!fn) {
    throw new Error(`no reducer found for action type "${type}"`);
  }

  const newState = fn(state, action.payload) || state;

  if (newState instanceof Promise) {
    //handleAsyncAction(newState);
    return state;
  }

  deepFreeze(newState);
  return newState;
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

@Injectable()
export class StateService {
  constructor(private state: State<AppState>, private store: Store<AppState>) {}

  /**
   * Dispatches a Redux action with a given type and payload.
   */
  dispatch(type: string, payload?: any) {
    this.store.dispatch({type, payload});
  }

  dispatchFilter(path, filterFn) {
    if (typeof filterFn !== 'function') {
      throw new Error('dispatchFilter must be passed a function');
    }

    this.dispatch(FILTER + ' ' + path, {path, value: filterFn});
  }

  /**
   * This adds elements to the end of the array at path.
   */
  dispatchPush(path, ...elements) {
    this.dispatch(PUSH + ' ' + path, {path, value: elements});
  }

  /**
   * Dispatches a Redux action that sets
   * the value found at path to a given value.
   */
  dispatchSet(path: string, value: any) {
    this.dispatch(SET + ' ' + path, {path, value});
  }

  getPathValue(path: string, state?: AppState): any {
    if (!path) return undefined;

    let value = state || this.getState();
    const parts = path.split(PATH_DELIMITER);
    for (const part of parts) {
      value = value[part];
      if (value === undefined) return value;
    }
    return value;
  }

  getState(): AppState {
    return this.state.getValue();
  }

  subscribe(path, callback) {
    // Get an observable to the path within the state.
    const obs$ = this.store.select(state => this.getPathValue(path, state));

    obs$.subscribe(value => callback(value));
  }

  watch(obj: Object, propToPathMap: PropToPathMap): void {
    Object.keys(propToPathMap).forEach(prop => {
      // Path defaults to same as prop if not set.
      const path = propToPathMap[prop] || prop;
      this.subscribe(path, v => obj[prop] = v);
    });
  }
}
