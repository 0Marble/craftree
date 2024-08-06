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

class Recepie {
    constructor(inputs, input_amounts, output, output_amount, machine) {
        this.inputs = inputs
        this.input_amounts = input_amounts
        this.output = output
        this.output_amount = output_amount
        this.machine = machine 
    }

    print() {
        let lhs = `${this.output} x${this.output_amount}`
        let rhs = ""
        for (let i = 0; i < this.inputs.length; i++) {
            rhs += `${this.inputs[i]} x${this.input_amounts[i]}, `
        }
        return `${lhs} <- ${rhs}`
    }
}

class RecepieStore {
    constructor() {
        this.recepies = new Map()
    }

    add_recepie(recepie) {
        console.assert(!this.recepies.has(recepie.output))
        this.recepies.set(recepie.output, recepie)
    }

    remove_recepie(recepie) {
        if (this.recepies.has(recepie.output)) {
            this.recepies.delete(recepie.output)
        }
    }

    evaluate(output, amount) {
        let actions = []
        let extra = new Map()
        this._evaluate(output, amount, actions, extra)
        return { actions: actions, extra: extra }
    }

    _evaluate(output, amount, actions, extra) {
        console.assert(amount > 0)
        if (!this.recepies.has(output)) {
            actions.push(Action.Leaf(output, amount))
            return
        }
        if (extra.has(output)) {
            let { extra_amount, store_idx } = extra.get(output)
            console.assert(extra_amount !== 0)
            if (extra_amount === amount) {
                extra.delete(output)
                actions.push(Action.Take(output, amount, store_idx))
                return
            } else if (extra_amount > amount) {
                extra.set(output, {
                    extra_amount: extra_amount - amount,
                    store_idx: store_idx,
                })
                actions.push(Action.Take(output, amount, store_idx))
                return
            } else {
                extra.delete(output)
                actions.push(Action.Take(output, extra_amount, store_idx))
                amount -= extra_amount
                // not return
            }
        }

        console.assert(amount > 0)
        let recepie = this.recepies.get(output)
        let recepie_instances = Math.ceil(amount / recepie.output_amount)
        for (let i = 0; i < recepie.inputs.length; i++) {
            this._evaluate(recepie.inputs[i], recepie.input_amounts[i] * recepie_instances, actions, extra)
        }

        let to_craft_amount = recepie_instances * recepie.output_amount
        actions.push(Action.Craft(recepie, recepie_instances))
        if (to_craft_amount !== amount) {
            console.assert(to_craft_amount > amount)
            console.assert(!extra.has(output))
            extra.set(output, {
                extra_amount: to_craft_amount - amount,
                store_idx: actions.length
            })
            actions.push(Action.Store(output, to_craft_amount - amount))
        }
    }
}

class Action {
    static Craft(recepie, recepie_instances) {
        let a = new Action()
        a.kind = 0
        a.recepie = recepie
        a.recepie_instances = recepie_instances
        return a
    }
    static Take(item, amount, store_idx) {
        let a = new Action()
        a.kind = 1
        a.item = item
        a.amount = amount
        a.store_idx = store_idx
        return a
    }
    static Leaf(item, amount) {
        let a = new Action()
        a.kind = 2
        a.item = item
        a.amount = amount
        return a
    }
    static Store(item, amount) {
        let a = new Action()
        a.kind = 3
        a.item = item
        a.amount = amount
        return a
    }
}
