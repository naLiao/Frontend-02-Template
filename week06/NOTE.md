### Week6 学习笔记 (2020.8.3 ~ 2020.8.9)

# At-rules
At-rules
  - @charset: [https://www.w3.org/TR/css-syntax-3/](https://www.w3.org/TR/css-syntax-3/)
  - @import: [https://www.w3.org/TR/css-cascade-4/](https://www.w3.org/TR/css-cascade-4/)
  - @media: [https://www.w3.org/TR/css3-conditional/](https://www.w3.org/TR/css3-conditional/)
  - @page: [https://www.w3.org/TR/css-page-3/](https://www.w3.org/TR/css-page-3/)
  - @counter-style: [https://www.w3.org/TR/css-counter-styles-3/](https://www.w3.org/TR/css-counter-styles-3/)
  - @keyframes: [https://www.w3.org/TR/css-animations-1/](https://www.w3.org/TR/css-animations-1/)
  - @fontface: [https://www.w3.org/TR/css-fonts-3/](https://www.w3.org/TR/css-fonts-3/)
  - @supports: [https://www.w3.org/TR/css3-conditional/](https://www.w3.org/TR/css3-conditional/)
  - @namespace: [https://www.w3.org/TR/css-namespaces-3/](https://www.w3.org/TR/css-namespaces-3/)

# 优先级
选择器的优先级是对一个选择器里包含的简单选择器进行计数。

```css
#id div.a#id {
  // ...
}
```

按前两周的 specificity 规则得出 [0, 2, 1, 1]，根据 S = 0 * N^3 + 2 * N^2 + 1 * N^1 + 1，得出优先级 S。

取 N = 1000000，得 S = 2000001000001。

在老的浏览器比如 IE6 中，为了节省内存将 N 取值 255，导致出现 bug（256 个 class 优先级相当于一个 id）。现代浏览器就将 N 取大（如65536），一般会选择 16 进制上比较整的数，256 的整次幂，因为 256 刚好一个字节。

# CSS计算时机
toy-browser中，CSS的计算时机为判断标签为startTag时。

回顾之前的 toy-browser 运行原理会发现，`:empty`、`:nth-last-child`、`:last-child`、`:only-child` 其实破坏了 css 的计算时机，在浏览器中实现并不好，性能也不太好，尽量少用。

尽量不要将选择器编写得过于复杂，有需要可以从 HTML 方面着手，比如增加 class。

## 为什么 first-letter 可以设置 float 之类的，而 first-line 不行呢
first-line设置float或display等属性后，可能会改变原排版的first-line，而first-letter不会影响，始终是选择文本第一个字。
所以first-letter可以设置，而first-line不行。

`first-letter` 和 `first-line` 的计算时机不同，`first-letter` 匹配到的文本在 css compute 之前就可以确定，而 `first-line` 匹配到的文本需在渲染后才能确定。如果给 `first-line` 添加了可以改变盒模型、改变排版的属性，则应用了这些属性后，原本 `first-line` 匹配的文本就不一定完全匹配了，需要重新计算，这样就陷入了死循环。