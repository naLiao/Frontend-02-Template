import { Component, createElement } from './framework.js'

class Carousel extends Component {
    constructor() {
        super()
        this.attributes = Object.create(null)
    }

    setAttribute(key, value) {
        this.attributes[key] = value
    }

    render() {
        this.root = document.createElement('div')
        this.root.classList.add('carousel')
        console.log('this.attributes: ', this.attributes);

        // d.forEach(item => {
        //     let div = createElement('div')
        //     div.backgroundImage = item
        //     div.mountTo(carousel)
        // })
        return this.root
    }
}

let d = [
    "./assets/images/bg_1.jpg",
    "./assets/images/bg_2.jpg",
    "./assets/images/bg_3.jpg",
    "./assets/images/bg_4.jpg"
]

let a = <Carousel src={d} />
a.mountTo(document.body)