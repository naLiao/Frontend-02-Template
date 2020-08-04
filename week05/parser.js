const css = require('css')

let currentToken = null
let stack = [{ type: "document", children: [] }]
let currentTextNode = null

// 存放CSS规则
let rules = []
function addCSSRules(text) {
    var ast = css.parse(text)
    console.log(JSON.stringify(ast, null, "      "))
    rules.push(...ast.stylesheet.rules)
}

function emit(token) {
    console.log('token: ', token);
    let topElement = stack[stack.length - 1]

    // 入栈操作
    if (token.type === 'startTag') {
        let element = {
            type: 'element',
            children: [],
            attributes: []
        }

        element.tagName = token.tagName

        for (let key in token) {
            if (key != 'type' && key != 'tagName') {
                element.attributes.push({
                    name: key,
                    value: token[key]
                })
            }
        }

        topElement.children.push(element)
        element.parent = topElement

        if (!token.isSelfClosing) {
            stack.push(element)
        }
        currentTextNode = null
        return
    }

    // 出栈操作
    if (token.type === 'endTag') {
        if (topElement.tagName !== token.tagName) {
            throw new Error('有标签没有闭合')
        } else {
            // 执行添加CSS规则的操作
            if (topElement.tagName === 'style') {
                addCSSRules(topElement.children[0].content)
            }
            stack.pop()
        }
        currentTextNode = null
        return
    }

    // 文本节点的处理
    if (token.type === 'text') {
        if (currentTextNode == null) {
            currentTextNode = {
                type: "text",
                content: token.content || ''
            }
            topElement.children.push(currentTextNode)
        } else {
            currentTextNode.content += token.content
        }
    }
}

const EOF = Symbol('EOF')

// 识别数据
function data(c) {
    if (c == '<') {
        return tagOpen
    }

    if (c == EOF) {
        emit({
            type: 'EOF'
        })
        return
    }
    // 文本节点
    emit({
        type: 'text',
        content: c
    })

    return data
}

function tagOpen(c) {
    if (c == '/') {
        return endTagOpen
    }

    if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: 'startTag',
            tagName: ''
        }
        return tagName(c)
    }

    return
}

function endTagOpen(c) {
    if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: 'endTag',
            tagName: ''
        }
        return tagName(c)
    }

    // 错误情况暂不处理
    if (c == '>') {

    }

    // 错误情况暂不处理
    if (c == EOF) {

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
        currentToken.tagName += c
        return tagName
    }

    if (c == '>') {
        emit(currentToken)
        return data
    }

    return tagName
}

function beforeAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName
    }

    if (c == '/' || c == '>' || c == EOF) {
        return afterAttributeName(c)
    }

    if (c == '=') {
        return
    }

    currentAttribute = {
        name: '',
        value: ''
    }
    return attributeName(c)
}

function attributeName(c) {
    if (c.match(/^[\t\n\f ]$/) || c == '/' || c == '>' || c == EOF) {
        return afterAttributeName(c)
    }

    if (c == '=') {
        return beforeAttributeValue
    }

    if (c == '\u0000') {
        return
    }

    currentAttribute.name += c
    return attributeName
}

function afterAttributeName(c) {
    if (c == '=') {
        return beforeAttributeValue
    }
}

function beforeAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/) || c == '/' || c == '>' || c == EOF) {
        return beforeAttributeValue
    }

    if (c == '\"') {
        return doubleQuotedAttibuteValue
    }

    if (c == '\'') {
        return singleQuotedAttibuteValue
    }

    return UnquotedAttibuteValue(c)

}

function doubleQuotedAttibuteValue(c) {
    if (c == '\"') {
        currentToken[currentAttribute.name] = currentAttribute.value
        return afterQuotedAttributeValue
    }
    if (c == '\u0000') {
        return
    }
    if (c == 'EOF') {
        return
    }
    currentAttribute.value += c
    return doubleQuotedAttibuteValue
}

function singleQuotedAttibuteValue(c) {
    if (c == '\'') {
        currentToken[currentAttribute.name] = currentAttribute.value
        return afterQuotedAttributeValue
    }
    if (c == '\u0000') {
        return
    }
    if (c == 'EOF') {
        return
    }
    currentAttribute.value += c
    return singleQuotedAttibuteValue
}

function afterQuotedAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName
    }
    if (c == '/') {
        return selfClosingStartTag
    }
    if (c == '>') {
        currentToken[currentAttribute.name] = currentAttribute.value
        emit(currentToken)
        return data
    }
    currentAttribute.value += c
    return doubleQuotedAttibuteValue
}

function UnQuotedAttibuteValue(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        currentToken[currentAttribute.name] = currentAttribute.value
        return beforeAttributeName
    }
    if (c == '/') {
        currentToken[currentAttribute.name] = currentAttribute.value
        return selfClosingStartTag
    }
    if (c == '>') {
        currentToken[currentAttribute.name] = currentAttribute.value
        emit(currentToken)
        return data
    }
    if (c == '\u0000') {
        return
    }
    if (c == 'EOF') {
        return
    }
    currentAttribute.value += c
    return UnQuotedAttibuteValue
}

function attibuteValue(c) {
    if (c.match(/^[\t\f\n ]$/)) {
        return beforeAttributeName
    }

    currentAttribute.value += c
    return attibuteValue
}

function selfClosingStartTag(c) {
    if (c == '>') {
        currentToken.isSelfClosing = true
        return data
    }

    if (c == EOF) {

    }

}

module.exports.parseHTML = function parseHTML(html) {
    let state = data
    for (let c of html) {
        state = state(c)
    }
    state = state(EOF)
    return stack
}