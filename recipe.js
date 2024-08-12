export class Recipe {
    constructor(inputs, outputs, machine) {
        this.inputs = inputs
        this.outputs = outputs
        this.machine = machine 
    }

    print() {
        let lhs = ""
        for (let {item, amount} of this.outputs) {
            lhs += `${item} x${amount}, `
        }
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
        this.items = new Map()
        this.recipes = []
        this.free = new Set()
        this.prices = new Map()
    }

    getItems() {
        return this.items.keys()
    }

    getMachines() {
        let m = new Set()
        for (let r of this.getAllRecipes()) {
            m.add(r.machine)
        }
        return m
    }

    getRecipePrice(recipe) {
        let price = 0
        for (let {item, amount} of recipe.inputs) {
            price += this.getItemPrice(item) * amount
        }
        return price
    }

    getItemPrice(item) {
        console.assert(this.items.has(item), item)
        if (this.prices.has(item)) return this.prices.get(item)
        let price = 1
        for (let {recipe} of this.getRecipes(item)) {
            let cost = this.getRecipePrice(recipe)
            let out = 0
            for (let {item, amount} of recipe.outputs) {
                out += amount
            }
            cost /= out
            if (cost < price) price = cost
        }
        this.prices.set(item, price)
        return price
    }

    addRecipe(recipe) {
        this.prices.clear()

        let idx = this.recipes.length
        if (this.free.size !== 0) {
            idx = this.free.keys().next().value
            this.recipes[idx] = recipe
            this.free.delete(idx)
        } else {
            this.recipes.push(recipe)
        }

        for (let i = 0; i < recipe.outputs.length; i++) {
            let {item, amount} = recipe.outputs[i]
            if (!this.items.has(item)) this.items.set(item, new Set())
            let variants = this.items.get(item)
            variants.add({ idx, out_index: i })
        }
        for (let {item, amount} of recipe.inputs) {
            if (!this.items.has(item)) this.items.set(item, new Set())
        }
    }

    removeRecipe(recipe) {
        for (let {item} of recipe.outputs) {
            if (!this.items.has(recipe.outputs.item)) {
                continue
            }
            for (let {idx} of this.items.get(recipe.output.item)) {
                if (this.recipes[idx] !== recipe) {
                    continue
                }
                this.items.delete(idx)
                this.free.add(idx)
                this.prices.clear()
                break
            }
        }
    }

    getAllRecipes() {
        return this.recipes.filter((r, i) => !this.free.has(i))
    }
    hasRecipes(item) {
        return this.items.has(item) && this.items.get(item).size !== 0
    }
    getRecipes(item) {
        let res = []
        for (let i of this.items.get(item)) {
            res.push({ recipe: this.recipes[i.idx], out_index: i.out_index })
        }
        return res
    }

    static VERSION = 1
    toString() {
        let obj = { version: RecipeStore.VERSION, recipes: [] }
        let index_map = []
        for (let i = 0; i < this.recipes.length; i++) {
            if (this.free.has(i)) {
                continue
            }
            obj.recipes.push(this.recipes[i])
        }
        let s = JSON.stringify(obj)
        return s
    }

    static fromString(str) {
        let obj = JSON.parse(str)
        if (obj.version === undefined || obj.version !== RecipeStore.VERSION) {
            return RecipeStore._fromStringOld(obj)
        }
        let rc = new RecipeStore()
        for (let r of Object.values(obj.recipes)) {
            rc.addRecipe(new Recipe(
                r.inputs,
                r.outputs,
                r.machine
            ))
        }
        return rc
    }

    static _fromStringOld(obj) {
        let rc = new RecipeStore()
        for (let r of Object.values(obj)) {
            rc.addRecipe(new Recipe(
                r.inputs,
                [r.output],
                r.machine
            ))
        }
        console.log(rc)
        return rc
    }
}
