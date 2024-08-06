class PriorityQueue {
    constructor() {
        this.vals = []
    }

    _parent(i) {
        return (i - 1) / 2
    }

    _left(i) {
        return 2 * i + 1
    }

    _right(i) {
        return 2 * i + 2
    }

    push(item, priority) {
        this.vals.push({val: item, priority: priority})
        let idx = this.vals.length - 1
        while (idx != 0) {
            let parent = this._parent(idx)
            if (this.vals[parent].priority < this.vals[idx].priority) {
                let t = this.vals[parent].priority 
                this.vals[parent].priority = this.vals[idx].priority 
                this.vals[idx].priority = t
                idx = parent
            } else {
                break
            }
        }
    }

    pop() {
        if (this.vals.length === 0) return null;
        let idx = this.vals.length - 1
        if (idx === 0) return this.vals.pop()
        let res = this.vals[0]
        this.vals[0] = this.vals.pop()

        while (idx + 1 !== this.vals.length) {
            let l = this._left(idx)
            let r = this._right(idx)
            let biggest = idx
            if (this.vals.length > l && this.vals[l].priority > this.vals[biggest].priority) {
                biggest = l
            }
            if (this.vals.length > r && this.vals[r].priority > this.vals[biggest].priority) {
                biggest = r
            }
            if (biggest === idx) {
                break
            }

            let t = this.vals[biggest]
            this.vals[biggest] = this.vals[idx]
            this.vals[idx] = t
            idx = biggest
        }
        return res
    }
}

class Item {
    constructor(name) {
        this.name = name
    }

    print() {
        return this.name
    }
}

class Recepie {
    constructor(inputs, input_amounts, output, output_amount, machine) {
        this.inputs = inputs
        this.input_amounts = input_amounts
        this.output = output
        this.output_amount = output_amount
        this.machine = machine 
    }
}

class RecepieStore {
    constructor() {
        this.items = new Map()
    }

    add_recepie(recepie) {
        if (!this.items.has(recepie.output.name)) this.items.set(recepie.output.name, [])
        this.items.get(recepie.output.name).push(recepie);
        console.log(this.items)
    }

    crafting_plan(item, amount) {
        if (!this.items.has(item.name)) {
            console.log("leaf node: ", item)
            return new CraftingPlan(item, amount, "")
        }
        const recepies = this.items.get(item.name)
        let prev = null
        for (const r of recepies) {
            let plan = new CraftingPlan(item, amount, r.machine)
            for (let i = 0; i < r.inputs.length; i++) {
                let input = this.crafting_plan(r.inputs[i], r.input_amounts[i] / r.output_amount * amount)
                plan.add_input(input)
            }
            plan.set_next_variant(prev)
            prev = plan
        }

        return prev
    }
}

class CraftingPlan {
    constructor(item, amount, machine) {
        this.item = item
        this.reqs = []
        this.amount = amount
        this.machine = machine
        this.next_variant = null
    }

    add_input(plan) {
        this.reqs.push(plan)
    }

    set_next_variant(plan) {
        this.next_variant = plan
    }

    is_leaf() {
        return this.reqs.length === 0
    }
}
