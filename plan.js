import { Storage, Evaluator } from "./evaluate.js"
import { Node } from "./graph.js"

export class Planner {
    constructor() {
        this.targets = new Map()
        this.storage = new Storage()
        this.reqs = new Map()
        this.steps = new Map()
        this.completed = new Map()
    }

    addTarget(item, amount) {
        if (!this.targets.has(item)) this.targets.set(item, 0)
        this.targets.set(item, this.targets.get(item) + amount)
    }
    removeTarget(item) {
        console.assert(this.targets.has(item))
        this.targets.delete(item)
    }
    clearTargets() {
        this.targets.clear()
    }

    reset() {
        this.targets = new Map()
        this.storage = new Storage()
        this.reqs = new Map()
        this.steps = new Map()
        this.completed = new Map()
    }

    recalculate(recipe_store) {
        let nodes = new Evaluator(recipe_store).evaluate(this.targets, this.storage)
        this.reqs.clear()
        this.steps.clear()
        console.log(nodes)
        for (let n of nodes) {
            this._summarizeGraph(n)
        }
    }

    setAmountInStorage(item, amount, recipe_store) {
        if (this.storage.has(item)) {
            this.storage.get(item, this.storage.cur(item))
        } 
        if (amount > 0) {
            this.storage.put(item, amount)
        }
        this.recalculate(recipe_store)
    }
    completeRequirement(item) {
        console.assert(this.reqs.has(item))
        console.assert(this.completed.has(item))
        this.storage.put(item, this.reqs.get(item))
        this.completed.set(item, true)
    }
    completeStep(item) {
        console.assert(this.steps.has(item))
        console.assert(this.completed.has(item))
        let {recipe, instances} = this.steps.get(item)
        let target_amount = recipe.output.amount * instances
        this.completed.set(item, true)
        this.storage.put(item, target_amount)
        for (let {item, amount} of recipe.inputs) {
            this.storage.get(item, amount * instances)
        }
    }

    getRequirements() {
        let res = new Map()
        for (let [item, amount] of this.reqs) {
            if (!this.completed.get(item)) res.set(item, amount)
        }
        return res
    }
    getSteps() {
        let res = new Map()
        for (let [item, {recipe, instances}] of this.steps) {
            if (!this.completed.get(item)) 
                res.set(item, {recipe, instances})
        }
        return res
    }
    getStorage() {
        return this.storage
    }
    getTargets() {
        return this.targets
    }
    isStepAvailable(item) {
        console.assert(this.steps.has(item), item)
        let {recipe, instances} = this.steps.get(item)
        for (let {item: input, amount} of recipe.inputs) {
            if (this.storage.cur(input) >= amount * instances) {
                continue
            }
            return false
        }
        return true
    }

    _summarizeGraph(node) {
        if (node.kind === Node.GET_KIND) {
            console.log("GET NODE", node)
            let item = node.item
            let amount = node.amount
            if (!this.reqs.has(item)) this.reqs.set(item, amount)
            else this.reqs.set(item, this.reqs.get(item) + amount)

            this.completed.set(item, false)
        } else if (node.kind === Node.CRAFT_KIND) {
            console.log("CRAFT NODE", node)
            let {item, amount} = node.recipe.output
            if (!this.steps.has(item)) this.steps.set(item, {
                instances: 0,
                recipe: node.recipe
            })
            let obj = this.steps.get(item)
            obj.instances += node.instances
            this.completed.set(item, false)

            for (let r of node.reqs) {
                this._summarizeGraph(r)
            }
        } else {
            console.assert(false, node, Node.CRAFT_KIND, Node.GET_KIND)
        }
    }
}
