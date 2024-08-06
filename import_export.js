const import_button = document.getElementById("import_recepies_button")
const export_button = document.getElementById("export_recepies_button")

export_button.addEventListener("click", () => {
    saveAsTextFile("recepies.json", recepieStoreToString(recepie_store))
})

import_button.addEventListener("change", () => {
    let reader = new FileReader()
    reader.onload = (e) => {
        let src = e.target.result
        let rc = recepieStoreFromString(src)
        console.log(rc)
        clearRecepies()
        for (let item of rc.items.keys()) {
            for (let r of rc.items.get(item)) {
                recepie_store.add_recepie(r)
                addRecepieToTable(r)
            }
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
    for (let item of recepie_store.items.keys()) {
        console.log(item)
        items[item] = recepie_store.items.get(item)
    }
    console.log(items)
    let s = JSON.stringify(items)
    console.log(s)
    return s
}

function recepieStoreFromString(str) {
    let rc = new RecepieStore()
    let items = JSON.parse(str)
    for (let item in items) {
        for (let r of items[item]) {
            rc.add_recepie(new Recepie(
                r.inputs.map((i) => new Item(i.name)),
                r.input_amounts,
                new Item(r.output.name),
                parseInt(r.output_amount),
                r.machine
            ))
        }
    }

    console.log(rc)
    return rc
}
