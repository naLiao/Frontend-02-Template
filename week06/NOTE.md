### Week6 学习笔记 (2020.8.3 ~ 2020.8.9)

笔记在前端技术 png 图片中

## 为什么 first-letter 可以设置 float 之类的，而 first-line 不行呢
first-line设置float或display等属性后，可能会改变原排版的first-line，而first-letter不会影响，始终是选择文本第一个字。
所以first-letter可以设置，而first-line不行。