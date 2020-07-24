const EOF = Symbol('EOF')

// 识别数据
function data(c) {
    if (c == '<') {
        return tagOpen
    }

    if (c == EOF) {
        return
    }
    // 文本节点
    return data
}

function tagOpen(c) {
    if (c == '/') {
        return endTagOpen
    }

    if (c.match(/^[a-zA-Z]/$)) {
        return tagName(c)
    }

    return
}

function endTagOpen(c) {
    if (c.match(/^[a-zA-Z]/$)) {

    }
}

function tagName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName
    }

    if (c == '/') {
        return selfClosingStartTag
    }

    if (c.match(/^[a-zA-Z]$/)) {
        return tagName
    }

    if (c == '>') {
        return data
    }

    return tagName
}

function beforeAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName
    }

    if (c == '>') {
        return data
    }

    if (c == '=') {
        return beforeAttributeName
    }

    return beforeAttributeName
}

function selfClosingStartTag(c) {
    if (c == '>') {
        currentToken.isSelfClosing = true
        return data
    }

    if (c == EOF) {

    }

}