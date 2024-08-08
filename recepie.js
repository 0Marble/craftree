
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

    evaluate(outputs, amounts, storage) {
        let actions = []
        let sim = storage.clone()
        for (let i = 0; i < outputs.length; i++) {
            this._evaluate(outputs[i], amounts[i], actions, sim)
        }
        return actions
    }

    _evaluate(output, amount, actions, storage) {
        console.assert(amount > 0)
        if (storage.has(output)) {
            let stored = storage.cur(output)
            if (stored >= amount) {
                storage.get(output, amount)
                return
            } else {
                storage.get(output, stored)
                amount -= stored
            }
        }
        if (!this.recepies.has(output)) {
            actions.push(Action.Get(output, amount))
            return
        } 
        let recepie = this.recepies.get(output)
        console.assert(recepie.output === output)
        
        let instances = Math.ceil(amount / recepie.output_amount);
        for (let i = 0; i < recepie.inputs.length; i++) {
            this._evaluate(recepie.inputs[i], recepie.input_amounts[i] * instances, actions, storage)
        }

        let crafted = instances * recepie.output_amount
        console.assert(crafted >= amount)
        if (crafted > amount) {
            console.assert(!storage.has(output))
            storage.put(output, crafted - amount)
        }
        actions.push(Action.Craft(recepie, instances))
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
    static Craft(recepie, instances) {
        let a = new Action()
        a.kind = 1
        a.recepie = recepie
        a.instances = instances
        return a
    }
}

class Storage {
    constructor() {
        this.stored = new Map()
    }

    clone() {
        let st = new Storage()
        for (let x of this.stored.keys()) {
            st.stored.set(x, this.stored.get(x))
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
        for (let i of this.stored.keys()) {
            res.push({item: i, amount: this.stored.get(i)})
        }
        return res
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
