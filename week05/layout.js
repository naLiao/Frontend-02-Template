function getStyle(element) {
    if (!element.style) {
        element.style = {}
    }

    for (let prop in element.computedStyle) {
        let p = element.computedStyle.value
        element.style[prop] = element.computedStyle[prop].value

        if (element.style[prop].toString().match(/px$/)) {
            element.style[prop] = parseInt(element.style[prop])
        }
        if (element.style[prop].toString().match(/^[0-9]+$/)) {
            element.style[prop] = parseInt(element.style[prop])
        }
    }
    return element.style
}

function layout(element) {
    if (!element.computedStyle) return

    //------------------------------------第一步：预处理----------------------------------------------
    let elementStyle = getStyle(element)
    // 只考虑flex布局
    if (elementStyle.display !== 'flex') return
    // 所有元素子节点
    let items = element.children.filter(item => item.type == 'element')
    // 支持order属性
    items.sort((a, b) => {
        return (a.order || 0) - (b.order || 0)
    })
    let style = elementStyle
    ['width', 'height'].forEach(size => {
        if (style[size] === 'auto' || style[size] === '') {
            style[size] = null
        }
    })
    if (!style.flexDirection || style.flexDirection == 'auto') {
        style.flexDirection = 'row'
    }
    // 加上默认属性
    let defaultProps = {
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        flexWrap: 'nowarp',
        alignContent: 'stretch'
    }
    Object.keys[defaultProps].forEach(item => {
        if (!style[item] || style[item] === 'auto') {
            style[item] = defaultProps[item]
        }
    })

    var mainSize, mainStart, mainEnd, mainSign, mainBase, crossSize, crossStart, crossEnd, crossSign, crossBase

    if (style.flexDirection == 'row') {
        mainSize = 'width'
        mainStart = 'left'
        mainEnd = 'right'
        mainSign = +1 // 强调是正一
        mainBase = 0

        crossSize = 'height'
        crossStart = 'top'
        crossEnd = 'bottom'
    }

    if (style.flexDirection == 'row-reverse') {
        mainSize = 'width'
        mainStart = 'right'
        mainEnd = 'left'
        mainSign = -1
        mainBase = style.width

        crossSize = 'height'
        crossStart = 'top'
        crossEnd = 'bottom'
    }

    if (style.flexDirection == 'column') {
        mainSize = 'height'
        mainStart = 'top'
        mainEnd = 'bottom'
        mainSign = +1
        mainBase = 0

        crossSize = 'width'
        crossStart = 'left'
        crossEnd = 'right'
    }

    if (style.flexDirection == 'column-reverse') {
        mainSize = 'height'
        mainStart = 'bottom'
        mainEnd = 'top'
        mainSign = -1
        mainBase = style.height

        crossSize = 'width'
        crossStart = 'left'
        crossEnd = 'right'
    }

    // 反向换行
    if (style.flexDirection == 'wrap-reverse') {
        let tmp = crossStart
        crossStart = crossEnd
        crossEnd = tmp
        crossSign = -1
    } else {
        crossBase = 0
        crossSign = 1
    }

    //------------------------------------第二步：入行----------------------------------------------
    let isAutoMainSize = false
    if (!style[mainSize]) {
        elementStyle[mainSize] = 0
        for (let i = 0; i < items.length; i++) {
            let item = items[i]
            if (itemStyle[mainSize] !== null || itemStyle[mainSize]) {
                elementStyle[mainSize] = elementStyle[mainSize] + itemStyle[mainSize]
            }
        }
    }
    isAutoMainSize = true

    let flexLine = []
    let flexLines = [flexLine]
    // 剩余空间
    let mainSpace = elementStyle[mainSize]
    let crossSpace = 0

    for (let i = 0; i < items.length; i++) {
        let item = items[i]
        let itemStyle = getStyle(item)

        if (itemStyle[mainSize] === null) {
            itemStyle[mainSize] = 0
        }

        // 可伸缩元素直接放进
        if (itemStyle.flex) {
            flexLine.push(item)
            // 不换行则直接放
        } else if (style.flexWrap === 'nowarp' && isAutoMainSize) {
            mainSpace -= itemStyle[mainSize]
            if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) {
                // 计算交叉轴最大尺寸，比如行高
                crossSpace = Math.max(crossSpace, itemStyle[crossSpace])
            }
            flexLine.push(item)
            // 计算换行情况
        } else {
            // 超出父元素按照父元素计算
            if (itemStyle[mainSize] > style[mainSize]) {
                itemStyle[mainSize] = style[mainSize]
            }
            // 需要换行:当前元素放不下
            if (mainSpace < itemStyle[mainSize]) {
                flexLine.mainSpace = mainSpace
                flexLine.crossSpace = crossSpace
                // 创建新行并放入当前元素
                flexLine = [item]
                flexLines.push(flexLine)
                mainSpace = style[mainSize]
                crossSpace = 0
            } else {
                // 不需要换行
                flexLine.push(item)
            }

            // 计算交叉轴尺寸
            if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) {
                crossSpace = Math.max(crossSpace, itemStyle[crossSpace])
            }

            mainSpace -= itemStyle[mainSize]
        }
    }
}