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
