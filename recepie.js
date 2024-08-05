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
}

class Recepie {
    constructor(inputs, input_amounts, output, output_amount, name) {
        this.inputs = inputs
        this.input_amounts = input_amounts
        this.output = output
        this.output_amount = output_amount
        this.name = name
    }
}

class RecepieStore {
    constructor() {
        this.items = new Map()
    }

    add_recepie(recepie) {
        if (!this.items.has(recepie.output)) this.items[recepie.output] = []
        this.item[recepie.output].push(recepie);
    }

    get_recepies(item) {
        if (!this.items.has(item)) return null
        return this.items[item]
    }

    crafting_plan(item) {
    }
}

class CraftingPlan {
    constructor(item) {
        this.item = item
        this.reqs = null
    }

    is_leaf() {
        return this.reqs === null
    }
}
