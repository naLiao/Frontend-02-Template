function createElement(type, attributes, ...children) {
    console.log('type: ', type);
    console.log('attributes: ', attributes);
    console.log('children: ', children);
    let element;

    if (typeof type === 'string')
        element = document.createElement(type)
    else
        element = new type

    for (let attr in attributes) {
        element.setAttribute(attr, attributes[attr])
    }
    for (let child of children) {
        if (typeof child === 'string') {
            child = document.createTextNode(child)
        }
        element.appendChild(child)
    }

    return element
}

class Div {
    constructor() {
        this.root = document.createElement('div')
        return this.root
    }

    setAttribute(key, value) {
        this.root.setAttribute(key, value)
    }
    appendChild(child) {
        console.log('child: ', child);
        this.root.appendChild(child)
    }
}

let a = <Div id="app">
    <span>1</span>
    <span>2</span>
    <span>3</span>
</Div>

document.body.appendChild(a)
console.log('a: ', a);