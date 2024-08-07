class PriorityQueue {
    constructor() {
        this.vals = []
    }

    _parent(i) {
        return Math.floor((i - 1) / 2)
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
        if (this.machine !== null) {
            return `${lhs} <- ${rhs} @ ${this.machine}`
        } else {
            return `${lhs} <- ${rhs}`
        }
    }
}

class RecepieStore {
    constructor(save_to_local_storage) {
        this.recepies = new Map()
        this.save_to_local_storage = save_to_local_storage
    }

    getItems() {
        let items = new Set()
        for (let r of this.recepies.values()) {
            items.add(r.output)
            for (let i of r.inputs) {
                items.add(i)
            }
        }

        return items
    }

    getMachines() {
        let m = new Set()
        for (let r of this.recepies.values()) {
            m.add(r.machine)
        }
        return m
    }

    add_recepie(recepie) {
        console.assert(!this.recepies.has(recepie.output))
        this.recepies.set(recepie.output, recepie)
        if (this.save_to_local_storage) {
            if (!saveRecepiesToLocalStorage(this)) {
                this.save_to_local_storage = false   
            }
        }
    }

    remove_recepie(recepie) {
        if (this.recepies.has(recepie.output)) {
            this.recepies.delete(recepie.output)
        }
    }

    evaluate(outputs, amounts) {
        let actions = new ActionGraph(this)
        for (let i = 0; i < outputs.length; i++){
            this._evaluate(outputs[i], amounts[i], actions)
        }
        return actions
    }

    _evaluate(output, amount, actions, extra) {
        if (!this.recepies.has(output)) {
            actions.store(output, amount)
            return
        } 

        let recepie = this.recepies.get(output)

        if (actions.nodes.has(output)) {
            let stored = actions.get_stored_amount(output)
            console.assert(stored >= 0)
            if (stored === amount) {
                actions.take(recepie.output, amount)
                return
            } else if (stored > amount) {
                actions.take(recepie.output, amount)
                return
            } else {
                actions.take(recepie.output, stored)
                amount -= stored
            }
        }

        let recepie_instances = Math.ceil(amount / recepie.output_amount)
        for (let i = 0; i < recepie.inputs.length; i++) {
            this._evaluate(recepie.inputs[i], recepie.input_amounts[i] * recepie_instances, actions)
        }

        let crafted_amount = recepie_instances * recepie.output_amount;
        actions.craft(recepie, recepie_instances)
        if (crafted_amount !== amount) {
            console.assert(crafted_amount > amount)
            actions.store(recepie.output, crafted_amount - amount)
        }
    }
}

class Node {
    constructor(item, reqs) {
        this.item = item 
        this.reqs = reqs
        this.craft = 0 
        this.take = 0
        this.store = 0
    }
}

class ActionGraph {
    constructor() {
        this.nodes = new Map()
    }
    craft(recepie, recepie_instances) {
        if (!this.nodes.has(recepie.output)) {
            let node = new Node(recepie.output, recepie.inputs.map((i) => this._add_or_get_node(i)))
            this.nodes.set(recepie.output, node)
        } 
        let node = this.nodes.get(recepie.output)
        node.craft += recepie_instances * recepie.output_amount
    }
    take(item, amount) {
        console.assert(this.nodes.has(item), item)
        let node = this.nodes.get(item)
        node.take += amount
        console.assert(node.take <= node.store, item)
    }
    store(item, amount) {
        let node = this._add_or_get_node(item)
        node.store += amount
    }

    _add_or_get_node(item) {
        if (!this.nodes.has(item)) {
            this.nodes.set(item, new Node(item, []))
        }
        return this.nodes.get(item)
    }

    get_stored_amount(item) {
        console.assert(this.nodes.has(item))
        let x = this.nodes.get(item)
        console.assert(x.take <= x.store)
        return x.store - x.take
    }

    topological_sort(outputs) {
        let q = new PriorityQueue()
        let visit_order = []
        for (let node of this.nodes.values()) {
            visit_order.push(node)
        }
        let heights = new Map()
        visit_order.sort((a, b) => this._height(a.item, heights) - this._height(b.item, heights))
        console.log(heights)

        return visit_order
    }

    _height(item, heights) {
        if (heights.has(item)) {
            return heights.get(item)
        } else {
            console.assert(this.nodes.has(item))
            let node = this.nodes.get(item)
            let max_h = 0 
            for (let r of node.reqs) {
                let h = this._height(r.item, heights)
                if (h + 1 > max_h) max_h = h + 1
            }
            heights.set(item, max_h)
            return max_h
        }
    }
}

class Queue {
    constructor() {
        this.pop_buf = []
        this.push_buf = []
    }

    push(item) {
        this.push_buf.push(item)
    }

    is_empty() {
        return this.push_buf.length === 0 && this.pop_buf.length === 0
    }

    pop() {
        if (this.pop_buf.length === 0) {
            this.pop_buf = this.push_buf.reverse()
            this.push_buf = []
        }
        return this.pop_buf.pop()
    }
}
