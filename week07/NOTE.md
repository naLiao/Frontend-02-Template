### Week6 学习笔记 (2020.8.10 ~ 2020.8.16)

CSS属性列举
在CSS属性.png图片中
https://github.com/naLiao/Frontend-02-Template/blob/master/week07/CSS%E5%B1%9E%E6%80%A7.png

# 应用技巧
- data uri + svg

# data uri
Data URI scheme允许我们使用内联将一些小的数据，直接嵌入到网页中，从而不用再从外部文件载入。常用于将图片嵌入网页。

- URI（Uniform Resource Identifier）:统一资源标识符，服务器资源名被称为统一资源标识符。
- URL（Uniform Resource Locator）:统一资源定位符，描述了一台特定服务器上某资源的特定位置。
- URN（Uniform Resource Name）:统一资源名称。

URL、URN是URI的子集。

使用data uri 引入svg
data:image/svg+xml,<svg width="100%" height="100%" version="1.1" xmlns="http://www.w3.org/2000/svg">...<svg>
