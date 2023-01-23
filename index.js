class StateStack {
    /**
     *  @example
     *  ```
     *  class YourClass extends StateStack {
     *      // the function onChange() is called every time the state changes, and is passed the new state
     *      // override this function to do what you want with the new state
     *      onChange(newState) {
     *          // do something with the new state
     *      }
     * 
     *      // the function onReject() is called when the state changes to a rejected state
     *      // override this function if you don't want an error thrown
     *      onReject() {
     *          // do something on rejection
     *      }
     *  
     *      // the function onClear() is called when the stack is cleared
     *      // override this function to do what you want with the stack being cleared
     *      onClear() {
     *          // do something on clearing
     *      }
     *  }
     * 
     *  // create a new instance of YourClass
     *  const yourClass = new YourClass();
     * 
     *  // add a new state to the stack
     *  yourClass.addState(yourState); // yourState can be anything you want, it will be passed to onChange()
     * 
     *  // go to the 'next' or 'prev' state
     *  // these will call onChange() with the new state, or if there are no states, it will call onReject()
     *  yourClass.next();
     *  yourClass.prev();
     * 
     *  // resolves the current state
     *  yourClass.resolve();
     *  ```
     */
    constructor() {
        this.states = [];
        this.currentState = null;
        this.currentIndex = -1;
        this.locked = false;
    }

    /**
     * 
     * @param {Any} state Anything
     * @returns Copied state with no dependencies
     */
    copyState(state) {
        return JSON.parse(JSON.stringify(state));
    }

    /**
     * 
     * @param {Any} state This can be anything, it will be passed to onChange()
     */
    addState(state) {
        if (this.currentIndex < this.states.length - 1) {
            // remove all states after currentIndex
            this.states = this.states.splice(0, this.currentIndex + 1);

            this.states.push(this.copyState(state));
            this.currentIndex = this.states.length - 1;
            this.currentState = this.states[this.currentIndex];
        } else {
            this.states.push(this.copyState(state));
            this.currentIndex = this.states.length - 1;
            this.currentState = this.states[this.currentIndex];
        }

        this.resolve();
    }

    /**
     *  @description Destroys the stack and calls onClear()
     */
    clearStates() {
        this.states = [];
        this.currentIndex = -1;
        this.currentState = null;
        this.onClear();
    }

    /**
     * @description Goes to the next state in the stack
     */
    next() {
        if (this.states.length > 0 && this.currentIndex < this.states.length - 1) {
            this.currentState = this.states[this.currentIndex + 1];
            this.currentIndex++;

            this.resolve();
        } else {
            this.onReject(this.currentState);
        }
    }

    /**
     * @description Goes to the previous state in the stack
     */
    prev() {
        if (this.states.length > 0 && this.currentIndex > 0) {
            this.currentState = this.states[this.currentIndex - 1];
            this.currentIndex--;
            // this.findBranch(this.currentIndex);
            this.resolve();
        } else {
            this.onReject(this.currentState);
        }
    }

    /**
     * @description Gets the number of states in the current stack
     */
    get numStacks() {
        return this.states.length;
    }

    /**
     * @description Resolves the current state
     */
    resolve() {
        if (this.locked) {
            this.onReject(this.currentState);
        } else {
            this.onChange(this.currentState);
        }
    }

    /**
     *  @description Customizable callback for when the state changes
     */
    onChange() {

    }

    /**
     *  @description Customizable callback for when the state changes to a rejected state
     */
    onReject() {
        throw new Error('State does not exist, nothing has changed');
    }

    /**
     * @description Customizable callback for when the stack is cleared
     */
    onClear() {

    }

    get hasNext() {
        return this.currentIndex < this.states.length - 1;
    }

    get hasPrev() {
        return this.currentIndex > 0;
    }
}



// stack of StateStacks
class BranchStack {
    constructor() {
        this.branches = {};
        this.currentBranch = null;
        this.currentPointer = null;
    }

    /**
     * 
     * @param {StateStack} stack state-stack 
     * @param {String} title title of the state-stack 
     */
    newBranch(stack, title) {
        if (this.branches.title) {
            console.error('Branch already exists');
            return;
        }

        this.branches[title] = stack;
        this.currentBranch = stack;
        this.currentPointer = title;
        this.onChange(this.currentBranch);
    }

    /**
     * 
     * @param {String} title title of the state-stack
     */
    deleteBranch(title) {
        if (this.currentPointer === title) {
            this.currentPointer = null;
            this.currentBranch = null;
        }
        delete this.branches[title];
    }

    get numStacks() {
        return Object.keys(this.branches).length;
    }

    /**
     * @description Creates a new state-stack and adds it to the current state-stack
     * @param {String} oldTitle old title of the state-stack
     * @param {String} newTitle new title of the state-stack
     */
    copyBranch(oldTitle, newTitle) {
        this.branches[newTitle] = JSON.parse(JSON.stringify(this.branches[oldTitle]));
    }

    goToBranch(title) {
        this.currentPointer = title;
        this.currentBranch = this.branches[title];
        this.onChange(this.currentBranch);
    }

    lockBranch(title) {
        this.branches[title].locked = true;
    }

    unlockBranch(title) {
        this.branches[title].locked = false;
    }

    get locked() {
        return this.currentBranch.locked;
    }

    get numStacks() {
        return Object.keys(this.branches).length;
    }

    onChange(branch) {
        try {
            branch.resolve();
        } catch (e) {
            throw new Error('Branch is not of type StateStack or does not exist');
        }
    }

    mergeStates(a, b) {
        return {
            ...a,
            ...b
        };
    }

    merge(branchTitle1, branchTitle2) {
        // iterate through each state in title2 and compare it to title1
        // if it is the same, do nothing and move on
        // if it is different, revert title1 to the state in title2

        const branch1 = this.branches[branchTitle1];
        const branch2 = this.branches[branchTitle2];

        const newBranch = JSON.parse(JSON.stringify(branch1));

        if (!Array.isArray(branch1.states)) throw new Error('Branch 1 is not of type StateStack');
        if (!Array.isArray(branch2.states)) throw new Error('Branch 2 is not of type StateStack');

        let newStates = branch2.map((state, index) => {
            if (branch1.states[index]) return this.mergeStates(branch1.states[index], state);
            else return state;
        });

        newBranch.states = newStates;
        newBranch.currentState = newStates[newBranch.currentIndex];
        newBranch.currentIndex = newBranch.currentIndex;
        newBranch.resolve();

        this.lockBranch(branchTitle1);
        this.lockBranch(branchTitle2);

        this.newBranch(newBranch, `${branchTitle1} + ${branchTitle2}`);
    }

    renameBranch(oldTitle, newTitle) {
        this.branches[newTitle] = this.branches[oldTitle];
        delete this.branches[oldTitle];

        this.currentBranch = this.branches[newTitle];
        this.currentPointer = newTitle;
    }
}

module.exports = { StateStack, BranchStack };