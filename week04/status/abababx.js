//  使用状态机实现字符串abababx解析

function match(str) {
    let state = start
    for (let char of str) {
        state = state(char)
        if (state === 'end') {
            return true
        }
    }
    return false
}

function start(char) {
    if (char === 'a') {
        return foundA
    } else {
        return start
    }
}

function foundA(char) {
    if (char === 'b') {
        return foundB
    } else {
        return start(char)
    }
}

function foundB(char) {
    if (char === 'a') {
        return foundA2
    } else {
        return start(char)
    }
}

function foundA2(char) {
    if (char === 'b') {
        return foundB2
    } else {
        return start(char)
    }
}

function foundB2(char) {
    if (char === 'a') {
        return foundA3
    } else {
        return start(char)
    }
}

function foundA3(char) {
    if (char === 'b') {
        return foundB3
    } else {
        return start(char)
    }
}

function foundB3(char) {
    if (char === 'x') {
        return 'end'
    } else {
        return foundB2(char)
    }
}

console.log(match('abababababababx')) // true
console.log(match('ababaabxab')) // false
