export class Recipe {
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

export class RecipeStore {
    constructor() {
        this.recipes = new Map()
    }

    getItems() {
        let items = new Set()
        for (let r of this.recipes.values()) {
            items.add(r.output.item)
            for (let i of r.inputs) {
                items.add(i.item)
            }
        }

        return items
    }

    getMachines() {
        let m = new Set()
        for (let r of this.recipes.values()) {
            m.add(r.machine)
        }
        return m
    }

    addRecipe(recipe) {
        console.assert(!this.recipes.has(recipe.output.item))
        this.recipes.set(recipe.output.item, recipe)
    }

    removeRecipe(recipe) {
        if (this.recipes.has(recipe.output.item)) {
            this.recipes.delete(recipe.output.item)
        }
    }

    getAllRecipes() {
        return this.recipes.values()
    }
    hasRecipe(item) {
        return this.recipes.has(item)
    }
    getRecipe(item) {
        console.assert(this.recipes.has(item))
        return this.recipes.get(item)
    }

    toString() {
        let items = {}
        for (let r of this.recipes.values()) {
            items[r.output.item] = r
        }
        let s = JSON.stringify(items)
        return s
    }
    static fromString(str) {
        let rc = new RecipeStore()
        let items = JSON.parse(str)
        for (let r of Object.values(items)) {
            rc.addRecipe(new Recipe(
                r.inputs,
                r.output,
                r.machine
            ))
        }
        return rc
    }
}
