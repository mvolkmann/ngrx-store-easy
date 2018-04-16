# ngrx-store-easy

This library provides a much easier way to write
Angular applications that use ngrx/store to manage state.

## Benefits

* No string constants are needed for action types.
* A reducer function that switches on action type is not needed.
* The dispatch function is accessed through a simple import rather than
  using the react-redux `connect` and `mapDispatchToProps` functions.
* Actions can be dispatched by providing just a type and payload
  rather than an action object.
* Each action type is handled by a single reducer function
  that is registered by action type and is simple to write.
* Simple actions that merely set a property value in the state
  (the most common kind) can be dispatched without writing
  reducer functions (see `dispatchSet`).
* Actions that modify a property based on its current value
  can be dispatched without writing reducer functions
  (see `dispatchTransform`).
* Actions that only delete a property
  can be dispatched without writing reducer functions
  (see `dispatchDelete`).
* Actions that only add elements to the end of an array
  can be dispatched without writing reducer functions
  (see `dispatchPush`).
* Actions that only remove elements from an array
  can be dispatched without writing reducer functions
  (see `dispatchFilter`).
* Actions that only modify elements in an array
  can be dispatched without writing reducer functions
  (see `dispatchMap`).
* All objects in the Redux state are automatically frozen
  to prevent accidental state modification.
* Asynchronous actions are handled in a simple way
  without requiring middleware or thunks.
* The complexity of nested/combined reducers can be bypassed.
* Redux state is automatically saved in `sessionStorage`
  (on every state change, but limited to once per second).
* Redux state is automatically loaded from `sessionStorage`
  when the browser is refreshed to avoid losing state.
* Integration with redux-devtools is automatically configured.

## Example app

See the `app` directory here.

## Setup

In `app.module.ts`, add the following imports:

```js
import {NseModule} from '../nse/nse.module';
```

Add NseModule following to the `imports` array.

If custom reducers are needed, define them
like the following example in any source files
that are loaded before the action is dispatched:

```js
import {StateSvc} from 'ngrx-store-easy';
// Inject StateSvc.

// Call addReducer once for each action type, giving it the
// function to be invoked when that action type is dispatched.
// These functions must return the new state
// and cannot modify the existing state.
stateSvc.addReducer('addToAge', (state, years) => {
  const {user} = state;
  return {
    ...state,
    user: {
      ...user,
      age: user.age + years
    }
  };
});
```

In components that need to dispatch actions,
do something like the following:

```js
import {StateService} from 'ngrx-store-easy';
// Inject StateService as stateSvc.
...
    // This assumes that addReducer was called earlier to define
    // a reducer function for the action type "setFirstName".
    stateSvc.dispatch('setFirstName', firstName);

    // If the setFirstName action just sets a value in the state,
    // perhaps user.firstName, the following can be used instead.
    // There is no need to implement simple reducer functions.
    stateSvc.dispatchSet('user.firstName', firstNameType, value);
```

In components that need to render data from the state,
do something like the following:

```js
import {StateService} from 'ngrx-store-easy';
...
  constructor(stateSvc: StateService) {
    // The first argument to watch is a state path.
    // The last argument is the property name to be set
    // on this object when the value at that path changes.
    stateSvc.watch('person.colors', this, 'colors'});
  }
```

## Form Elements Tied to State Paths

It is common to have `input`, `select`, and `textarea` elements
with `onChange` handlers that get their value from `event.target.value`
and dispatch an action where the value is the payload.
An alternative is to use the provided `nse-input`, `nse-select`,
and `nse-textarea` components as follows:

HTML `input` elements can be replaced by the `nse-input` component.
For example,
```js
<nse-input path="user.firstName"></nse-input>
```

The `type` property defaults to `'text'`,
but can be set to any valid value including `'checkbox'`.

The value used by the `nse-input` is the state value at the specified path.
When the user changes the value, this component
updates the value at that path in the state.

To perform additional processing of changes such as validation,
supply an `onChange` prop that refers to a function (coming soon).

HTML `textarea` elements can be replaced by the `nse-textarea` component.
For example,
```js
<nse-textarea path="feedback.comment"></nse-textarea>
```

HTML `select` elements can be replaced by the `nse-textarea` component.
For example,
```js
<nse-select path="user.favoriteColor">
  <option>red</option>
  <option>green</option>
  <option>blue</option>
</nse-select>
```
If the `option` elements have a value attribute, that value
will be used instead of the text inside the `option`.

For a set of radio buttons, use the `nse-radio-buttons` component.
For example,
```js
<nse-radio-buttons
  class="flavor"
  [list]="radioButtonList"
  path="favoriteFlavor"
></nse-radio-buttons>
```
where radioButtonList is a component property that is set as follows:
```js
const radioButtonList = [
  {text: 'Chocolate', value: 'choc'},
  {text: 'Strawberry', value: 'straw'},
  {text: 'Vanilla', value: 'van'}
];
```
When a radio button is clicked the state property `favoriteFlavor`
will be set the value of that radio button.

For a set of checkboxes, use the `nse-checkboxes` component.
For example,
```js
<nse-checkboxes class="colors" [list]="checkboxList"></nse-checkboxes>
```
where checkboxList is set as follows:
```js
const checkboxList = [
  {text: 'Red', path: 'color.red'},
  {text: 'Green', path: 'color.green'},
  {text: 'Blue', path: 'color.blue'}
];
```
When a checkbox is clicked the boolean value at the corresponding path
will be toggled between false and true.

## Asynchronous Actions

If a function passed to `addReducer` returns a `Promise`
and a matching action is dispatched,
it will wait for that `Promise` to resolve and then
update the state to the resolved value of the `Promise`.

Here's an example of such a reducer function:
```js
addReducer('myAsyncThing', (state, payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Data in payload would typically be used
      // in the following call to an asynchronous function.
      const result = await fetch('some-url');

      // Build the new state using the current state
      // obtained by calling getState() rather than
      // the state passed to the reducer function
      // because it may have changed
      // since the asynchronous activity began.
      const newState = {...getState(), someKey: result};

      resolve(newState);
    } catch (e) {
      reject(e);
    }
  });
});
```

That's everything to you need to know to use ngrx-store-easy.
Code simply!

## Reminders for maintainers

To release a new version:
1. bump version in package.json
2. check in and push all changes
3. npm run package
4. npm run publish
