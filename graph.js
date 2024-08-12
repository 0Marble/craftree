export class Node {
    constructor() {
        this.kind = 69
    }

    static GET_KIND = 0
    static CRAFT_KIND = 1

    static Get(item, amount) {
        let n = new Node()
        n.kind = Node.GET_KIND
        n.item = item
        n.amount = amount
        return n
    }
    static Craft(recipe, instances, reqs) {
        let n = new Node()
        n.kind = Node.CRAFT_KIND
        n.recipe = recipe
        n.reqs = reqs
        n.instances = instances
        return n
    }
}

export class Squasher {
    constructor(nodes) {
        this.nodes = nodes
        this.node_at_depth = new Array()
    }

    _addNode(node) {
        if (node.kind === Node.GET_KIND && node.depth === undefined) {
            node.depth = 0
            if (this.node_at_depth.length <= node.depth) this.node_at_depth.push(new Map())
            let new_nodes = this.node_at_depth[node.depth]

            if (!new_nodes.has(node.item)) {
                new_nodes.set(node.item, Node.Get(node.item, node.amount))
            } else {
                let n = new_nodes.get(node.item)
                n.amount += node.amount
            }
        } else if (node.kind === Node.CRAFT_KIND && node.depth === undefined) {
            let reqs = []
            node.depth = 0
            for (let n of node.reqs) {
                let {depth, new_node} = this._addNode(n)
                if (depth + 1 > node.depth) node.depth = depth + 1
                reqs.push(new_node)
            }

            if (this.node_at_depth.length <= node.depth) this.node_at_depth.push(new Map())
            let new_nodes = this.node_at_depth[node.depth]

            if (!new_nodes.has(node.recipe)) {
                new_nodes.set(node.recipe, Node.Craft(node.recipe, node.instances, reqs))
            } else {
                let n = new_nodes.get(node.recipe)
                n.instances += node.instances
            }
        }

        if (node.kind === Node.GET_KIND) {
            return { 
                depth: node.depth, 
                new_node: this.node_at_depth[node.depth].get(node.item)
            }
        } else if (node.kind === Node.CRAFT_KIND) {
            return { 
                depth: node.depth, 
                new_node: this.node_at_depth[node.depth].get(node.recipe)
            }
        }
    }

    squash() {
        this.node_at_depth = new Array()
        let new_nodes = new Array()
        for (let node of this.nodes) {
            new_nodes.push(this._addNode(node).new_node)
        }

        return new_nodes
    }

    _dfs(nodes) {
        let visited = new Set()
        let stack = nodes
        let res = []

        while (stack.length !== 0) {
            let node = stack.pop()
            res.push(node)
            visited.add(node)
            if (node.kind === Node.GET_KIND) continue
            for (let n of node.reqs) {
                if (visited.has(n)) continue
                stack.push(n)
            }
        }
        return res
    }
}
