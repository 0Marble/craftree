
class Planner {
    constructor(evaluator) {
        this.evaluator = evaluator
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

    reset() {
        this = new Planner(this.evaluator)
    }

    recalculate() {
        let actions = this.evaluator.evaluate(this.targets, this.storage)
        this._summarizeActions(actions)
    }

    setAmountInStorage(item, amount) {
        if (this.storage.has(item)) {
            this.storage.get(item, this.storage.cur(item))
        } 
        if (amount > 0) {
            this.storage.put(item, amount)
        }
        this.recalculate()
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
    }

    getRequirements() {
        let res = new Map()
        for (let {item, amount} of this.reqs) {
            if (!this.completed.get(item)) res.set(item, amount)
        }
        return res
    }
    getSteps() {
        let res = new Map()
        for (let {recepie, instances} of this.steps) {
            if (!this.completed.get(recepie.output.output)) 
                res.set(recepie.output.output, {recepie, instances})
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
        console.assert(this.steps.has(item))
        let {recepie, instances} = this.steps.get(item)
        for (let {input, amount} of recepie.inputs) {
            if (this.storage.has(input) && this.storage.cur(input) >= amount * instances) {
                continue
            }
            return false
        }
        return true
    }

    _summarizeActions(actions) {
        this.reqs = new Map()
        this.steps = new Map()

        for (let a of actions) {
            if (a.kind === 0) {
                let item = a.item
                let amount = a.amount
                if (!this.reqs.has(item)) this.reqs.set(item, amount)
                else this.reqs.set(item, this.reqs.get(item) + amount)

                this.completed.set(item, false)
            } else if (a.kind === 1) {
                let {output, amount} = a.recepie.output
                if (!this.stpes.has(output)) this.steps.set(output, {
                    instances: 0,
                    recepie: a.recepie
                })
                let obj = this.steps.get(output)
                obj.instances += a.instances
                this.completed.set(output, false)
            } else {
                console.assert(false, a)
            }
        }
    }
}
