//  使用状态机实现字符串abcabx解析

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
    if (char === 'x') {
        return 'end'
    } else {
        return foundB(char)
    }
}


console.log(match('bbaabcabx')) // true
console.log(match('abcabcababcabx')) // true
