//  使用状态机实现字符串abcdef解析

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
    if (char === 'c') {
        return foundC
    } else {
        return start(char)
    }
}

function foundC(char) {
    if (char === 'd') {
        return foundD
    } else {
        return start(char)
    }
}

function foundD(char) {
    if (char === 'e') {
        return foundE
    } else {
        return start(char)
    }
}

function foundE(char) {
    if (char === 'f') {
        return 'end'
    } else {
        return start(char)
    }
}


console.log(match('aabcdeffasdg')) // true
console.log(match('agrahrharh')) // false
