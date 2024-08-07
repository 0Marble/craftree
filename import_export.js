const import_button = document.getElementById("import_recepies_button")
const export_button = document.getElementById("export_recepies_button")

function saveRecepiesToLocalStorage(recepie_store) {
    let s = recepieStoreToString(recepie_store)
    console.log("Saving...")
    try {
        let ls = window.localStorage
        ls.setItem("recepies", s)
    } catch (e) {
        alert("Couldn't save recepies to the browser local storage, consider exporting them")
        return false
    }
    return true
}

function loadRecepiesFromLocalStorage() {
    console.log("Loading...")
    try {
        let ls = window.localStorage
        let src = ls.getItem("recepies")
        if (src === null) {
            return
        }
        let rc = recepieStoreFromString(src)
        clearRecepies()
        for (let r of rc.recepies.values()) {
            recepie_store.add_recepie(r)
            addRecepieToTable(r)
        }
    } catch(e) {
        alert("Couldn't load recepies from the browser local storage, consider importing them")
    }
}

loadRecepiesFromLocalStorage()

export_button.addEventListener("click", () => {
    saveAsTextFile("recepies.json", recepieStoreToString(recepie_store))
})

import_button.addEventListener("change", () => {
    let reader = new FileReader()
    reader.onload = (e) => {
        let src = e.target.result
        let rc = recepieStoreFromString(src)
        clearRecepies()
        for (let r of rc.recepies.values()) {
            recepie_store.add_recepie(r)
            addRecepieToTable(r)
        }
    }
    reader.readAsText(import_button.files[0])
})

function saveAsTextFile(name, contents) {
    let data = new Blob([contents], {type: "text/plain"})
    let url = URL.createObjectURL(data)
    let a = document.createElement("a")
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
}

function recepieStoreToString(recepie_store) {
    let items = {}
    for (let r of recepie_store.recepies.values()) {
        items[r.output] = r
    }
    let s = JSON.stringify(items)
    return s
}

function recepieStoreFromString(str) {
    let rc = new RecepieStore(false)
    let items = JSON.parse(str)
    for (let item in items) {
        let r = items[item]
        rc.add_recepie(new Recepie(
            r.inputs,
            r.input_amounts,
            r.output,
            parseInt(r.output_amount),
            r.machine
        ))
    }

    return rc
}
