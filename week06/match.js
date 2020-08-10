/* 编写一个 match 函数。
    它接受两个参数，第一个参数是一个选择器字符串性质，第二个是一个 HTML 元素。
    这个元素你可以认为它一定会在一棵 DOM 树里面。
    通过选择器和 DOM 元素来判断，当前的元素是否能够匹配到我们的选择器。
    （不能使用任何内置的浏览器的函数，
    仅通过 DOM 的 parent 和 children 这些 API，
    来判断一个元素是否能够跟一个选择器相匹配。）
    以下是一个调用的例子
*/
// 父元素序列
var domList = []

function match(selector, element) {
  // 拆分选择器，当前选择器在最前面
  let selectors = selector.split(" ").reverse();
  console.log('需要匹配的选择器是: ', selectors)
  let parsedSelectors = []

  // 循环处理每一段选择器，解析选择器
  selectors.forEach(currentSelector => {
    let parsedSelector = {
      idSelectors: [],
      classSelectors: [],
      tagSelector: {
        type: 'tag',
        name: ''
      }
    }
    if (!currentSelector) return;

    if (!currentSelector.includes('#') && !currentSelector.includes('.')) {
      parsedSelector.tagSelector.name = currentSelector
    } else {
      let idArray = currentSelector.split('#')

      // 处理第一段
      if (idArray[0]) {
        if (idArray[0].includes('.')) {
          let classArray = idArray[0].split('.')
          for (let i = 1; i < classArray.length; i++) {
            parsedSelector.classSelectors.push({
              type: 'class',
              name: classArray[i]
            })
          }
          parsedSelector.tagSelector.name = classArray[0]
        } else {
          parsedSelector.tagSelector.name = idArray[0]
        }
      }

      // 有id选择器
      if (idArray.length > 1) {
        for (let i = 1; i < idArray.length; i++) {
          let selector = idArray[i]
          if (selector.includes('.')) {
            // 取出唯一id
            let idSelector = selector.substring(0, selector.indexOf('.'))
            let classArray = selector.split('.')
            for (let i = 1; i < classArray.length; i++) {
              classArray[i] && parsedSelector.classSelectors.push({
                type: 'class',
                name: classArray[i]
              })
            }
            idSelector && parsedSelector.idSelectors.push({
              type: 'id',
              name: idSelector
            })
          } else {
            let idSelector = selector
            parsedSelector.idSelectors.push({
              type: 'id',
              name: idSelector
            })
          }
        }
      }

    }

    parsedSelectors.push(parsedSelector)

    parsedSelector = {
      idSelectors: [],
      classSelectors: [],
      tagSelector: {
        type: 'tag',
        name: ''
      }
    }
  });

  console.log('parsedSelectors: ', parsedSelectors);

  // 第一个元素不匹配直接返回不匹配
  let isCurrentElementMatch = matchOneToOne(parsedSelectors[0], element)
  // console.log('isCurrentElementMatch: ', isCurrentElementMatch);
  if (!isCurrentElementMatch) {
    console.log('当前元素匹配不成功！')
    return false
  }

  console.log('当前元素匹配成功！')

  // 获取父级序列
  parentDomList(element)
  console.log('domList: ', domList);

  // 计算父级序列与
  let matchedNumber = 1

  var j = 1
  for (let i = 0; i < domList.length; i++) {
    if (matchOneToOne(parsedSelectors[j], domList[i])) {
      j++
    }
  }
  if (j >= parsedSelectors.length) {
    console.log('选择器匹配！')
    return true
  } else {
    console.log('选择器不匹配!')
    return false
  }

}

function matchOneToOne(parsedSelector, element) {
  // console.log('parsedSelector: ', parsedSelector);
  // console.log('element: ', element);

  // 校验标签选择器
  if (parsedSelector.tagSelector.name) {
    if (element.tagName !== parsedSelector.tagSelector.name) {
      console.log('标签匹配不成功！')
      return false
    }
  }


  let arributes = element.attributes
  if (!arributes || !Array.isArray(arributes)) {
    return false
  }

  // 校验id选择器
  if (parsedSelector.idSelectors.length) {
    let idAttibutes = arributes.filter(item => item.name == 'id').map(item => item.value)
    console.log('idAttibutes: ', idAttibutes);
    for (let i = 0; i < parsedSelector.idSelectors.length; i++) {
      if (!idAttibutes.some(item => item === parsedSelector.idSelectors[i].name)) {
        console.log('id匹配不成功！', parsedSelector.idSelectors[i].name, idAttibutes)
        return false
      }
    }
  }

  // 校验class选择器
  if (parsedSelector.classSelectors.length) {
    let classAttibutes = arributes.filter(item => item.name == 'class').map(item => item.value)
    console.log('classAttibutes: ', classAttibutes);
    for (let i = 0; i < parsedSelector.classSelectors.length; i++) {
      if (!classAttibutes.some(item => item === parsedSelector.classSelectors[i].name)) {
        console.log('class匹配不成功！', parsedSelector.classSelectors[i].name, classAttibutes)
        return false
      }
    }
  }

  return true

}


function parentDomList(element) {
  if (element.parent) {
    if (element.parent.tagName !== 'html') {
      domList.push(element.parent)
      parentDomList(element.parent)
    } else {
      return
    }
  } else {
    return
  }
}

match(".parent div.class1.class2#id1", {
  tagName: "div",
  type: "element",
  attributes: [{
    name: 'class',
    value: 'class1'
  },
  {
    name: 'class',
    value: 'class2'
  },
  {
    name: 'id',
    value: 'id1'
  }],
  children: [],
  parent: {
    tagName: "p",
    parent: {
      tagName: 'div',
      attributes: [
        {
          name: 'class',
          value: 'parent1'
        },
        {
          name: 'class',
          value: 'parent'
        }
      ],
      parent: {
        tagName: 'html'
      }
    }
  }
});
