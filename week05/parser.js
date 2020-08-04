const css = require('css')

let currentToken = null
let stack = [{ type: "document", children: [] }]
let currentTextNode = null

function match(element, selector) {
    // console.log('element------------------: ', element, selector, '-------------------------------'); // element------------------:  {
    //     type: 'element',
    //         children: [],
    //             attributes: [{ name: 'id', value: 'myid' }],
    //                 tagName: 'div',
    //                     computedStyle: { }
    // } #myid-------------------------------

    if (!selector || !element.attributes) {
        return false
    }

    if (selector.charAt(0) == '#') {
        let attr = element.attributes.filter(item => item.name == 'id')[0]
        return attr && attr.value === selector.substring(1)
    }
    if (selector.charAt(0) == '.') {
        let attr = element.attributes.filter(item => item.name == 'class')[0]
        return attr && attr.value === selector.substring(1)
    }
    return element.tagName == selector
}

// 存放CSS规则
let rules = []
function addCSSRules(text) {
    var ast = css.parse(text)
    rules.push(...ast.stylesheet.rules)
}

function computeCSS(element) {
    // console.log('rules:', rules)
    // console.log("compute CSS for element: ", element)
    // 父元素序列，最内元素排到最前面，['myidElement', divElement,  xxxElement, divElement, body, html]
    var elements = stack.slice().reverse()
    // console.log('elements: ', elements);
    if (!element.computedStyle) {
        element.computedStyle = {}
    }

    // style解析后有rules
    for (let rule of rules) {
        // 只考虑复合选择器，由简单选择器和空格连接而成，改成数组格式，当前元素在最前面['#myid', 'div', 'div']
        var selectorParts = rule.selectors[0].split(" ").reverse()
        // console.log('selectorParts: ', selectorParts);

        // 当前元素不匹配，直接跳出
        if (!match(element, selectorParts[0])) {
            continue
        }

        let matched = false

        // 将选择器的每一个依次与父元素序列对比，匹配加一
        var j = 1
        for (let i = 0; i < elements.length; i++) {
            if (match(elements[i], selectorParts[j])) {
                j++
            }
        }
        if (j >= selectorParts.length) {
            matched = true
        }
        // 计算computedStyle属性
        if (matched) {
            // console.log("Element", element, "matched rule", rule)
            let declarations = rule.declarations
            // console.log('declarations: ', declarations);
            for (let declaration of declarations) {
                if (!element.computedStyle[declaration.property]) {
                    element.computedStyle[declaration.property] = {}
                }
                element.computedStyle[declaration.property].value = declaration.value
            }
            console.log(element.computedStyle)
        }
    }
}

function emit(token) {
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

        computeCSS(element)

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