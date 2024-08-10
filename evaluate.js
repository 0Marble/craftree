
export class Evaluator {
    constructor(recipe_store) {
        this.recipe_store = recipe_store
    }

    evaluate(targets, storage) {
        let actions = []
        let sim = storage.clone()
        for (let [item, amount] of targets) {
            this._evaluate(item, amount, actions, sim)
        }
        return actions
    }

    _evaluate(item, amount, actions, storage) {
        console.assert(amount > 0, item, amount)
        if (storage.has(item)) {
            let stored = storage.cur(item)
            if (stored >= amount) {
                storage.get(item, amount)
                return
            } else {
                storage.get(item, stored)
                amount -= stored
            }
        }
        if (!this.recipe_store.hasRecipe(item)) {
            actions.push(Action.Get(item, amount))
            return
        } 
        let recipe = this.recipe_store.getRecipe(item)
        console.assert(recipe.output.item === item, item, amount, recipe)
        
        let instances = Math.ceil(amount / recipe.output.amount);
        for (let {item, amount} of recipe.inputs) {
            this._evaluate(item, amount * instances, actions, storage)
        }

        let crafted = instances * recipe.output.amount
        console.assert(crafted >= amount)
        if (crafted > amount) {
            console.assert(!storage.has(item))
            storage.put(item, crafted - amount)
        }
        actions.push(Action.Craft(recipe, instances))
    }
}

class Action {
    constructor() {
        this.kind = 0
    }
    static Get(item, amount) {
        let a = new Action()
        a.kind = 0
        a.item = item
        a.amount = amount
        return a
    }
    static Craft(recipe, instances) {
        let a = new Action()
        a.kind = 1
        a.recipe = recipe
        a.instances = instances
        return a
    }
}

export class Storage {
    constructor() {
        this.stored = new Map()
    }

    clone() {
        let st = new Storage()
        for (let [item, amount] of this.stored) {
            st.stored.set(item, amount)
        }
        return st
    }

    put(item, amount) {
        if (!this.stored.has(item)) this.stored.set(item, amount)
        else this.stored.set(item, this.cur(item) + amount)
        return this.cur(item)
    }

    has(item) {
        return this.stored.has(item)
    }

    cur(item) {
        console.assert(this.stored.has(item), this, item)
        let amount = this.stored.get(item)
        console.assert(amount > 0, this, item)
        return amount
    }

    get(item, amount) {
        let stored = this.cur(item)
        console.assert(stored >= amount)
        if (stored === amount) {
            this.stored.delete(item)
        } else {
            this.stored.set(item, stored - amount)
        }
    }

    items() {
        let res = []
        for (let [item, amount] of this.stored) {
            res.push({item, amount})
        }
        return res
    }
}

