import { Storage, Evaluator } from "./evaluate.js"
import { Node } from "./graph.js"

export class Planner {
    constructor() {
        this.targets = new Map()
        this.storage = new Storage()
        this.completed = []
        this.nodes = []
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
        this.nodes = []
        this.completed = []
    }

    recalculate(recipe_store) {
        let nodes = new Evaluator(recipe_store).evaluate(this.targets, this.storage)
        this._setNodes(nodes)
    }

    _setNodes(nodes) {
        this.nodes = []
        this.completed = []

        for (let n of nodes) {
            this._addNode(n)
        }
        this.nodes.sort((a, b) => a.depth - b.depth)
        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].idx = i
        }
    }

    _addNode(node) {
        if (node.idx !== undefined) return this.nodes[node.idx].depth
        node.idx = this.nodes.length
        if (node.kind === Node.GET_KIND) {
            this.nodes.push(node)
            node.depth = 0
            return 0
        } else if (node.kind === Node.CRAFT_KIND) {
            this.nodes.push(node)
            node.depth = 0
            for (let n of node.reqs) {
                let d = this._addNode(n)
                if (d + 1 > node.depth) node.depth = d + 1
            }
            return node.depth
        }
    }

    setAmountInStorage(item, amount, recipe_store) {
        if (this.storage.cur(item) !== 0) {
            this.storage.get(item, this.storage.cur(item))
        } 
        if (amount > 0) {
            this.storage.put(item, amount)
        }
        this.recalculate(recipe_store)
    }
    getStorage() {
        return this.storage
    }
    getTargets() {
        return this.targets
    }

    setCompleted(node, completed) {
        this.completed[node.idx] = completed
        if (completed) {
            console.assert(this.isAvailableToCheck(node))
            if (node.kind === Node.GET_KIND) {
                this.storage.put(node.item, node.amount)
            } else {
                let {item, amount} = node.recipe.output
                this.storage.put(item, amount * node.instances)
                for (let {item, amount} of node.recipe.inputs) {
                    this.storage.get(item, amount * node.instances)
                }
            }
        } else {
            console.assert(this.isAvailableToUncheck(node))
            if (node.kind === Node.GET_KIND) {
                this.storage.get(node.item, node.amount)
            } else {
                let {item, amount} = node.recipe.output
                this.storage.get(item, amount * node.instances)
                for (let {item, amount} of node.recipe.inputs) {
                    this.storage.put(item, amount * node.instances)
                }
            }
        }
    }

    isAvailableToCheck(node) {
        if (node.kind === Node.GET_KIND) return true
        for (let n of this.nodes[node.idx].reqs) {
            if (!this.completed[n.idx]) return false
        }
        return true
    }
    isAvailableToUncheck(node) {
        if (node.kind === Node.GET_KIND) {
            return this.storage.cur(node.item) >= node.amount
        } else if (node.kind === Node.CRAFT_KIND) {
            return this.storage.cur(node.recipe.output.item) >= node.instances * node.recipe.output.amount
        }
    }

    isCompleted(node) {
        return this.completed[node.idx]
    }

    getNodes() {
        return this.nodes
    }
}
