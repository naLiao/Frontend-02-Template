/* 编写一个 match 函数。
    它接受两个参数，第一个参数是一个选择器字符串性质，第二个是一个 HTML 元素。
    这个元素你可以认为它一定会在一棵 DOM 树里面。
    通过选择器和 DOM 元素来判断，当前的元素是否能够匹配到我们的选择器。
    （不能使用任何内置的浏览器的函数，
    仅通过 DOM 的 parent 和 children 这些 API，
    来判断一个元素是否能够跟一个选择器相匹配。）
    以下是一个调用的例子
*/
function match(selector, element) {
  // 拆分选择器，当前选择器在最前面
  let selectors = selector.split(" ").reverse();
  console.log("selectors: ", selectors);

  selectors.forEach(currentSelector => {
    if (!currentSelector) return;
    var strs = currentSelector.match(/(\#\S+)/);
    console.log("strs: ", strs);
    console.log("$1: ", RegExp.$1);
    console.log("$2: ", RegExp.$2);
    console.log("$3: ", RegExp.$3);
  });
}

match("div #id.class", {
  tagName: "div",
  type: "element",
  children: [],
  parent: {
    tagName: "body"
  }
});
