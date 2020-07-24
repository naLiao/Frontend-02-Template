function lookForAb(str) {
    let foundA = false
    for (let char of str) {
        if (char === 'a') {
            foundA = true
            continue
        }
        if (foundA && char === 'b') {
            return true
        } else {
            foundA = false
        }
    }
    return false
}

console.log(lookForAb('aabb'))  // true
console.log(lookForAb('asdgg'))  // false