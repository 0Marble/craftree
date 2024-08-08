import { Storage, Evaluator } from "./evaluate.js"

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

    recalculate(recepie_store) {
        let actions = new Evaluator(recepie_store).evaluate(this.targets, this.storage)
        this._summarizeActions(actions)
    }

    setAmountInStorage(item, amount, recepie_store) {
        if (this.storage.has(item)) {
            this.storage.get(item, this.storage.cur(item))
        } 
        if (amount > 0) {
            this.storage.put(item, amount)
        }
        this.recalculate(recepie_store)
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
        let {recepie, instances} = this.steps.get(item)
        let target_amount = recepie.output.amount * instances
        this.completed.set(item, true)
        this.storage.put(item, target_amount)
        for (let {item, amount} of recepie.inputs) {
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
        for (let [item, {recepie, instances}] of this.steps) {
            if (!this.completed.get(item)) 
                res.set(item, {recepie, instances})
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
        let {recepie, instances} = this.steps.get(item)
        for (let {item: input, amount} of recepie.inputs) {
            if (this.storage.has(input) && this.storage.cur(input) >= amount * instances) {
                continue
            }
            return false
        }
        return true
    }

    _summarizeActions(actions) {
        this.reqs.clear()
        this.steps.clear()

        for (let a of actions) {
            if (a.kind === 0) {
                let item = a.item
                let amount = a.amount
                if (!this.reqs.has(item)) this.reqs.set(item, amount)
                else this.reqs.set(item, this.reqs.get(item) + amount)

                this.completed.set(item, false)
            } else if (a.kind === 1) {
                let {item, amount} = a.recepie.output
                if (!this.steps.has(item)) this.steps.set(item, {
                    instances: 0,
                    recepie: a.recepie
                })
                let obj = this.steps.get(item)
                obj.instances += a.instances
                this.completed.set(item, false)
            } else {
                console.assert(false, a)
            }
        }
    }
}
