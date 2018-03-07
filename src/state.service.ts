import {Injectable} from '@angular/core';
import {ActionReducerMap, State, Store, StoreModule, select} from '@ngrx/store';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {throttle} from 'lodash/function';

import {AppState} from './app.model';
import {initialState} from './initial-state';
/*
import {ReduxCheckboxesComponent} from './redux-checkboxes.component';
import {ReduxInputComponent} from './redux-input.component';
import {ReduxRadioButtonsComponent} from './redux-radio-buttons.component';
*/

export const FILTER = '@@filter';
export const PATH_DELIMITER = '.';
export const PUSH = '@@push';
export const SET = '@@set';
const STATE_KEY = 'reduxState';

const reducers = {
  '@ngrx/store/init': () => null,
  '@@redux/INIT': () => null,
  '@@async': (state, payload) => payload,
  [FILTER]: filterPath,
  [PUSH]: pushPath,
  [SET]: setPath
};

interface ReducerFn {
  (state: Object, payload?: any): Object;
}
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

export function getDeclarations() {
  return [
    //ReduxCheckboxesComponent,
    //ReduxInputComponent,
    //ReduxRadioButtonsComponent
  ];
}

export function getImports(environment) {
  // Redux setup using one reducer for all actions.
  const reducerMap: ActionReducerMap<any> = {};
  const metaReducers = [() => reducer];
  const import1 = StoreModule.forRoot(reducerMap, {
    initialState: loadState(),
    metaReducers
  });

  // Redux devtools setup
  const import2 = StoreDevtoolsModule.instrument({
    logOnly: environment.production,
    maxAge: 25 // # of states to retain
  });

  return [import1, import2];
}

/*
function handleAsyncAction(promise) {
  promise
    .then(newState => dispatch('@@async', newState))
    .catch(error => console.trace(error));
}
*/

/**
 * This is called on app startup and
 * again each time the browser window is refreshed.
 */
function loadState() {
  const {sessionStorage} = window; // not available in tests

  try {
    const json = sessionStorage ? sessionStorage.getItem(STATE_KEY) : null;
    if (!json) return initialState;

    // When parsing errors Array, change to a Set.
    return JSON.parse(
      json,
      (key, value) => (key === 'errors' ? new Set(value) : value)
    );
  } catch (e) {
    console.error('redux-util loadState:', e.message);
    return initialState;
  }
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

function saveState(state) {
  try {
    // When stringifying errors Set, change to an Array.
    const json = JSON.stringify(
      state,
      (key, value) => (key === 'errors' ? [...state.errors] : value)
    );

    sessionStorage.setItem(STATE_KEY, json);
  } catch (e) {
    console.error('redux-util saveState:', e.message);
    throw e;
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

interface PropToPathMap {
  [prop: string]: string;
}

@Injectable()
export class StateService {
  constructor(private state: State<AppState>, private store: Store<AppState>) {
      this.store.subscribe(
        throttle(
          () => saveState(this.getState()),
          1000,
          {leading: false}));
  }

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
      this.subscribe(path, v => (obj[prop] = v));
    });
  }
}
