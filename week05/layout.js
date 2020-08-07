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
    // console.log('element: ', element);

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

    let props = ['width', 'height']

    props.forEach(size => {
        if (style[size] === 'auto' || style[size] === '') {
            style[size] = null
        }
    })

    if (!style.flexDirection || style.flexDirection == 'auto') {
        style.flexDirection = 'row'
    }
    // 加上默认属性
    let defaultProps = {
        'flex-direction': 'row',
        'align-items': 'stretch',
        'justify-content': 'flex-start',
        'flex-wrap': 'nowarp',
        'align-content': 'stretch'
    }
    Object.keys(defaultProps).forEach(item => {
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
            let itemStyle = getStyle(item)
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
    var crossSpace = 0

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
            // console.log('style: ', style)
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

        flexLine.mainSpace = mainSpace

        // 计算交叉轴尺寸
        if (style.flexWrap === 'nowarp' || isAutoMainSize) {
            flexLine.crossSpace = (style[crossSize] !== undefined) ? style[crossSize] : crossSpace
        } else {
            flexLine.crossSpace = crossSpace
        }
    }

    //------------------------------------第三步：计算主轴元素位置----------------------------------------------
    // 单行且元素尺寸之和超出父元素尺寸
    if (mainSpace < 0) {
        let scale = style[mainSize] / style[mainSize] - mainSpace
        let currentMain = mainBase

        for (let i = 0; i < items.length; i++) {
            let item = items[i]
            let itemStyle = getStyle(item)

            if (itemStyle.flex) {
                itemStyle[mainSize] = 0
            }

            itemStyle[mainSize] = itemStyle[mainSize] * scale
            itemStyle[mainStart] = currentMain
            itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize]
            // 每一个元素后面排下一个元素
            currentMain = itemStyle[mainEnd]
        }
    } else {
        flexLines.forEach(flexLineItems => {
            let flexTotal = 0
            // console.log('flexLineItems: ', flexLineItems);

            // 计算flexTotal
            for (let i = 0; i < flexLineItems.length; i++) {
                let item = flexLineItems[i]
                let itemStyle = getStyle(item)

                if (itemStyle.flex !== null && itemStyle.flex !== (void 0)) {
                    flexTotal += parseInt(itemStyle.flex)
                    continue
                }
            }

            // 有flex元素
            if (flexTotal > 0) {
                for (let i = 0; i < flexLineItems.length; i++) {
                    let item = flexLineItems[i]
                    let itemStyle = getStyle(item)

                    let scale = itemStyle.flex / flexTotal
                    if (itemStyle.flex) {
                        itemStyle[mainSize] = mainSpace * scale
                    }
                    itemStyle[mainStart] = currentMain
                    itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize]
                    currentMain = itemStyle[mainEnd]
                }
            } else {
                // currentMain表示起始排位置点，step表示间隙
                if (style.justifyContent === 'flex-start') {
                    var currentMain = mainBase
                    var step = 0
                }
                if (style.justifyContent === 'flex-end') {
                    var currentMain = mainSpace * mainSign + mainBase
                    var step = 0
                }
                if (style.justifyContent === 'center') {
                    var currentMain = mainSpace / 2 * mainSign + mainBase
                    var step = 0
                }
                if (style.justifyContent === 'space-between') {
                    var step = mainSpace / (items.length - 1) * mainSign
                    var currentMain = mainBase
                }
                if (style.justifyContent === 'space-around') {
                    var step = mainSpace / items.length * mainSign
                    var currentMain = step / 2 + mainBase
                }
                for (let i = 0; i < flexLineItems.length; i++) {
                    let item = flexLineItems[i]
                    itemStyle = getStyle(item)
                    itemStyle[mainStart] = currentMain
                    itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize]
                    currentMain = itemStyle[mainEnd] + step
                }
            }

        })
    }

    //------------------------------------第四步：计算交叉轴尺寸----------------------------------------------
    var crossSpace

    if (!style[crossSize]) {
        crossSpace = 0
        elementStyle[crossSize] = 0
        for (let i = 0; i < flexLines.length; i++) {
            elementStyle[crossSize] = elementStyle[crossSize] + flexLines[i].crossSpace
        }
    } else {
        crossSpace = style[crossSize]
        for (let i = 0; i < flexLines.length; i++) {
            crossSpace -= flexLines[i].crossSpace
        }
    }

    if (style.flexWrap === 'warp-reverse') {
        crossBase = style[crossSize]
    } else {
        crossBase = 0
    }

    // 计算每一行的交叉轴尺寸
    let lineSize = style[crossSize] / flexLines.length

    let step
    if (style.alignContent === 'flex-start') {
        crossBase += 0
        step = 0
    }
    if (style.alignContent === 'flex-end') {
        crossBase += crossSign * crossSpace
        step = 0
    }
    if (style.alignContent === 'center') {
        crossBase += crossSign * crossSpace / 2
        step = 0
    }
    if (style.alignContent === 'space-between') {
        crossBase += 0
        step = crossSpace / (flexLines.length - 1)
    }
    if (style.alignContent === 'space-around') {
        step = crossSpace / (flexLines.length)
        crossBase += crossSign * step / 2
    }
    if (style.alignContent === 'stretch') {
        step = 0
        crossBase += 0
    }
    flexLines.forEach(items => {
        var lineCrossSize = style.alignContent === 'stretch' ?
            items.crossSpace + crossSpace / flexLines.length :
            items.crossSpace

        for (let i = 0; i < items.length; i++) {
            let item = items[i]
            let itemStyle = getStyle(item)

            // 子元素优先，子元素没有设置用父元素
            let align = itemStyle.alignSelf || style.alignItems

            if (itemStyle[crossSize] === null) {
                itemStyle[crossSize] = (align === 'stretch') ?
                    lineCrossSize : 0
            }
            if (align === 'flex-start') {
                itemStyle[crossStart] = crossBase
                itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize]
            }
            if (align === 'flex-end') {
                itemStyle[crossStart] = crossBase + crossSign * lineCrossSize
                itemStyle[crossEnd] = itemStyle[crossStart] - crossSign * itemStyle[crossSize]
            }
            if (align === 'center') {
                itemStyle[crossStart] = crossBase + crossSign * (lineCrossSize - itemStyle[crossSize]) / 2
                itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize]
            }
            if (align === 'strecth') {
                itemStyle[crossStart] = crossBase
                itemStyle[crossEnd] = crossBase[crossStart] + crossSign * itemStyle[crossSize]

                itemStyle[crossSize] = crossSign * (itemStyle[crossSize])
            }
        }
        crossBase += crossSign * (lineCrossSize + step)
    })
}

module.exports = layout