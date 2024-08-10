// function saveRecipesToLocalStorage(recipe_store) {
//     let s = recipeStoreToString(recipe_store)
//     console.log("Saving...")
//     try {
//         let ls = window.localStorage
//         ls.setItem("recipes", s)
//     } catch (e) {
//         alert("Couldn't save recipes to the browser local storage, consider exporting them")
//         return false
//     }
//     return true
// }
//
// function loadRecipesFromLocalStorage() {
//     console.log("Loading...")
//     try {
//         let ls = window.localStorage
//         let src = ls.getItem("recipes")
//         if (src === null) {
//             return
//         }
//         let rc = recipeStoreFromString(src)
//         clearRecipes()
//         for (let r of rc.recipes.values()) {
//             recipe_store.add_recipe(r)
//             addRecipeToTable(r)
//         }
//     } catch(e) {
//         alert("Couldn't load recipes from the browser local storage, consider importing them")
//     }
// }
//
// loadRecipesFromLocalStorage()
//
// export_button.addEventListener("click", () => {
//     saveAsTextFile("recipes.json", recipeStoreToString(recipe_store))
// })
//
// import_button.addEventListener("change", () => {
//     let reader = new FileReader()
//     reader.onload = (e) => {
//         let src = e.target.result
//         let rc = recipeStoreFromString(src)
//         clearRecipes()
//         for (let r of rc.recipes.values()) {
//             recipe_store.add_recipe(r)
//             addRecipeToTable(r)
//         }
//     }
//     reader.readAsText(import_button.files[0])
// })

export function readFromTextFile(file, onRead) {
    let reader = new FileReader()
    reader.onload = (e) => {
        let src = e.target.result
        onRead(src)
    }
    reader.readAsText(file)
}

export function saveAsTextFile(name, contents) {
    let data = new Blob([contents], {type: "text/plain"})
    let url = URL.createObjectURL(data)
    let a = document.createElement("a")
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
}

