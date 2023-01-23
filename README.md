# js-state-stack
JavaScript State management library

## Installation
CLI:
```bash
npm install js-state-stack
```
CDN:
```html
<script src="https://cdn.jsdelivr.com/npm/js-state-stack/state-stack.js"></script>
```
## Overview
js-state-stack is a simple state management library for JavaScript. It is designed to be simple and easy to use. It is also designed to be lightweight and fast.

## Usage
### Creating a StateStack
```javascript

const onChange = () => {} // custom onChange function
const onClear = () => {} // custom onClear function
const onReject = () => {} // custom onReject function

const stateStack = new StateStack(onChange, onClear, onReject);
```
Or
```javascript
class CustomStateStackClass extends StateStack {
    onChange() {
        // custom onChange function
    }

    onClear() {
        // custom onClear function
    }

    onReject() {
        // custom onReject function
    }
}

const myStateStack = new CustomStateStackClass();
```

### Managing the states
A `state` can be anything you wish. Every state change, it will fire either onChange() or onReject() which you can use to do whatever you want. Both functions will pass in the current `State.content` as a parameter. Use this to render the state of whatever you want.

```javascript
const stateStack = new StateStack(onChange, onClear, onReject);

// all of these fire teh StateStack.onChange() function passing in the current state
stateStack.addState('state1');
stateStack.addState('state2');
stateStack.addState('state3');

stateStack.states; // [State: {content: 'state1'}, State: {content: 'state2'}, State: {content: 'state3'}]
stateStack.currentState; // State: {content: 'state3'}


stateStack.prev(); // 'state2' - fires StateStack.onChange() function
stateStack.prev(); // 'state1' - StateStack.onChange()
stateStack.prev(); // 'state1' (no change) - StateStack.onReject()
stateStack.hasNext; // true
stateStack.hasPrev; // false

stateStack.next(); // 'state2' - StateStack.onChange()
stateStack.next(); // 'state3' - StateStack.onChange()
stateStack.next(); // 'state3' (no change) - StateStack.onReject()
stateStack.hasNext; // false
stateStack.hasPrev; // true

stateStack.first(); // 'state1' - StateStack.onChange()
stateStack.last(); // 'state3' - StateStack.onChange()

stateStack.clear(); // fires StateStack.onClear() function
stateStack.states; // []
```

## Branches
While a `StateStack` uses an `Array` of states, a `BranchStack` uses an object which contains `StateStack`s. Each have a unique name. This allows you to have multiple states that can be managed independently of each other. Every branch change runs `BranchStack.currentBranch.onChange()` which you can use to do whatever you want.

```javascript
const branchStack = new BranchStack(onChange, onClear, onReject);

/* Adding Branches */
branchStack.newBranch('branch1', new StateStack());

branchStack.branches; // { branch1: StateStack }
branchStack.currentBranch; // StateStack (branch1)

branchStack.copyBranch('branch1', 'branch2'); // does not change currentBranch

branchStack.branches; // { branch1: StateStack, branch2: StateStack }
branchStack.currentBranch; // StateStack (branch1)

/* Switching Branches */
branchStack.goToBranch('branch2'); // changes currentBranch to branch2

branchStack.branches; // { branch1: StateStack, branch2: StateStack }
branchStack.currentBranch; // StateStack (branch2)


/* Deleting Branches */
branchStack.deleteBranch('branch1'); // deletes branch1

branchStack.branches; // { branch2: StateStack }
branchStack.currentBranch; // StateStack (branch2)

branchStack.deleteBranch('branch2'); // throws error because branch2 is the currentBranch

/* Renaming Branches */
branchStack.renameBranch('branch2', 'branch3'); // renames branch2 to branch3

branchStack.branches; // { branch3: StateStack }
branchStack.currentBranch; // StateStack (branch3)

/* Merge Branches */
branchStack.newBranch('branch1', new StateStack());
branchStack.newBranch('branch2', new StateStack());

branchStack.branches; // { branch1: StateStack, branch2: StateStack, branch3: StateStack }

branchStack.mergeBranches('branch1', 'branch2', 'branch4'); // merges branch1 and branch2 into branch4
```