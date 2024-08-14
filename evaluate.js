import { Node, Squasher } from "./graph.js"

export class Evaluator {
    constructor(recipe_store) {
        this.recipe_store = recipe_store
    }

    evaluate(targets, storage) {
        let nodes = []
        let s = new SimulatedStorage(storage)
        for (let [item, amount] of targets) {
            for (let n of this._evaluate(item, amount, s)) {
                nodes.push(n)
            }
        }
        return new Squasher(nodes).squash()
    }


    _evaluate(item, amount, storage) {
        console.assert(amount > 0, item, amount)
        let outs = []
        let stored = storage.cur(item)
        if (stored >= amount) {
            return storage.get(item, amount)
        } else {
            for (let node of storage.get(item, stored)) {
                outs.push(node)
            }
            amount -= stored
        }
        if (!this.recipe_store.hasRecipes(item)) {
            outs.push(Node.Get(item, amount))
            return outs
        } 

        let recipe = null
        let out_index = null
        let min_price = null
        for (let {recipe: r, out_index: o} of this.recipe_store.getRecipes(item)) {
            let instances = Math.ceil(amount / r.outputs[o].amount);
            let price = this.recipe_store.getRecipePrice(r) 
            for (let {item, amount} of r.inputs) {
                let cur = storage.cur(item)
                if (cur >= amount * instances) price -= amount * this.recipe_store.getItemPrice(item)
                else price -= cur * this.recipe_store.getItemPrice(item)
            }
            price *= instances
            if (min_price === null || min_price > price) {
                min_price = price
                recipe = r
                out_index = o
            }
        }
        console.assert(recipe !== null, item, this.recipe_store.hasRecipes(item), this.recipe_store.getRecipes(item))
        
        let reqs = []
        let instances = Math.ceil(amount / recipe.outputs[out_index].amount);
        for (let {item, amount} of recipe.inputs) {
            for (let node of this._evaluate(item, amount * instances, storage)) {
                reqs.push(node)
            }
        }

        let crafted = instances * recipe.outputs[out_index].amount
        console.assert(crafted >= amount)
        let node = Node.Craft(recipe, instances, reqs) 
        outs.push(node)
        if (crafted > amount) {
            console.assert(storage.cur(item) === 0, item, storage)
            storage.put(item, crafted - amount, node)
        }
        for (let i = 0; i < recipe.outputs.length; i++) {
            if (i === out_index) continue
            let {item, amount} = recipe.outputs[i]
            storage.put(item, amount * instances, node)
        }
        return outs
    }
}

class SimulatedStorage {
    constructor(storage) {
        this.storage = new Map()
        for (let {item, amount} of storage.items()) {
            let access = new Set()
            access.add({ amount, node: null })
            this.storage.set(item, access)
        }
    }

    put(item, amount, node) {
        if (!this.storage.has(item)) this.storage.set(item, new Set())
        let access = this.storage.get(item)
        for (let x of access) {
            console.assert(x.node !== node, access, item, amount, node)
        }
        access.add({ amount, node })
    }

    get(item, amount) {
        let res = []
        if (!this.storage.has(item)) return res

        let collected = 0
        let to_remove = []
        let access = this.storage.get(item)
        for (let x of access) {
            if (collected + x.amount < amount) {
                collected += x.amount
                to_remove.push(x)
                if (x.node) res.push(x.node)
            } else if (collected + x.amount === amount) {
                to_remove.push(x)
                if (x.node) res.push(x.node)
                break
            } else if (collected < amount && collected + x.amount > amount) {
                x.amount -= amount - collected
                if (x.node) res.push(x.node)
                break
            } else {
                console.assert(false, item, amount, res, this.storage)
            }
        }

        for (let x of to_remove) {
            access.delete(x)
        }

        return res
    }

    cur(item) {
        if (!this.storage.has(item)) return 0
        let sum = 0
        for (let {amount} of this.storage.get(item)) sum += amount
        return sum
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

    cur(item) {
        if (!this.stored.has(item)) return 0
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

