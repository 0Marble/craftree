
function editDistance(s1, s2) {
    let buf = new Array(2)
    buf[0] = new Array(s2.length + 1)
    buf[1] = new Array(s2.length + 1)
    let prev = 0
    let cur = 1

    for (let i = 0; i < s2.length + 1; i++) {
        buf[prev][i] = i
    }

    for (let i = 0; i < s1.length; i++) {
        buf[cur][0] = i * 50 + 1
        for (let j = 1; j < s2.length + 1; j++) {
            let del = buf[prev][j] + 50 // delete from s1
            let ins = buf[cur][j - 1] + 1 // insert into s1
            let sub = buf[prev][j - 1] // switch a letter in s1
            if (s1[i] !== s2[j - 1]) {
                let a = s1[i]
                let b = s2[j - 1]
                if (a.toUpperCase() === b.toUpperCase()) {
                    sub += 1
                } else {
                    sub += 50
                }
            }
            buf[cur][j] = Math.min(del, ins, sub)
        }
        prev = (prev + 1) % 2
        cur = (cur + 1) % 2
    }

    return buf[prev][s2.length]
}

class Suggestions {
    constructor(inputDiv, input, getWords) {
        this.inputDiv = inputDiv
        this.input = input
        this.getWords = getWords

        this.input.addEventListener("input", () => this.showSuggestions())
        document.addEventListener("click", () => {
            let allSuggestionBoxes = document.getElementsByClassName(Suggestions.BOX_CLASS_NAME)
            let to_remove = []
            for (let b of allSuggestionBoxes) {
                to_remove.push(b)
            }
            for (let b of to_remove) {
                b.remove()
            }
        })
    }

    static BOX_CLASS_NAME = "suggestions_box"
    static SUGGESTIONS_COUNT = 10

    showSuggestions() {
        let val = this.input.value

        let dists = []
        for (let word of this.getWords()) {
            dists.push({word: word, dist: editDistance(val, word)})
        }
        dists.sort((a, b) => a.dist - b.dist)

        let sb = this.getSuggestionsBox()
        for (let i = 0; i < Math.min(Suggestions.SUGGESTIONS_COUNT, dists.length); i++) {
            let variant = document.createElement("div")
            variant.append(dists[i].word)
            variant.addEventListener("click", () => {this.input.value = dists[i].word})
            sb.append(variant)
        }
    }

    getSuggestionsBox() {
        let existingBox = this.inputDiv.getElementsByClassName(Suggestions.BOX_CLASS_NAME)
        if (existingBox.length !== 0) {
            console.assert(existingBox.length === 1)
            existingBox[0].remove()
        }
        let suggestionsBox = document.createElement("div")
        suggestionsBox.className = Suggestions.BOX_CLASS_NAME
        this.inputDiv.append(suggestionsBox)

        return suggestionsBox
    }
}
