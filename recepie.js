class Recepie {
    constructor(inputs, output, machine) {
        this.inputs = inputs
        this.output = output
        this.machine = machine 
    }

    print() {
        let {item, amount} = this.output
        let lhs = `${item} x${amount}`
        let rhs = ""
        for (let {item, amount} of this.inputs) {
            rhs += `${item} x${amount}, `
        }
        if (this.machine !== null) {
            return `${lhs} <- ${rhs} @ ${this.machine}`
        } else {
            return `${lhs} <- ${rhs}`
        }
    }
}

class RecepieStore {
    constructor() {
        this.recepies = new Map()
    }

    getItems() {
        let items = new Set()
        for (let r of this.recepies.values()) {
            items.add(r.output.item)
            for (let i of r.inputs) {
                items.add(i.item)
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

    addRecepie(recepie) {
        console.assert(!this.recepies.has(recepie.output.item))
        this.recepies.set(recepie.output.item, recepie)
    }

    removeRecepie(recepie) {
        if (this.recepies.has(recepie.output.item)) {
            this.recepies.delete(recepie.output.item)
        }
    }

    getAllRecepies() {
        return this.recepies
    }
    hasRecepie(item) {
        return this.recepies.has(item)
    }
    getRecepie(item) {
        console.assert(this.recepies.has(item))
        return this.recepies.get(item)
    }
}
