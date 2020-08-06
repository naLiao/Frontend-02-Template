// 使用基于ip的net包，实现http请求
const net = require('net')
const parser = require('./parser')

class Request {
    constructor(config) {
        // 整理传入的参数，给默认值
        let { method = 'GET', host, port = 80, path = '/', headers = {}, body = {} } = config
        this.method = method
        this.host = host
        this.port = port
        this.path = path
        this.headers = headers
        this.body = body
        // Content-Type必须有的字段
        if (!this.headers['Content-Type']) {
            this.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        }

        // bodyText有四种常见的编码格式

        if (this.headers['Content-Type'] === 'application/json') {
            this.bodyText = JSON.stringify(this.body)
        }

        // 遍历body对象变成queryString格式
        if (this.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
            this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&')
        }

        // 长度在headers中必传，否则是非法http请求
        this.headers['Content-length'] = this.bodyText.length
    }

    // 设置请求文本格式
    toString() {
        return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}\r
\r
${this.bodyText}`
    }

    send(connection) {
        return new Promise((resolve, reject) => {
            //  收到信息的解析
            const parser = new ResponseParser()

            // 接收或创建一个TCP连接
            if (connection) {
                connection.write(this.toString())
            } else {
                connection = net.createConnection({
                    host: this.host,
                    port: this.port
                }, () => {
                    connection.write(this.toString())
                });
            }

            // 将接收到的数据传入parser
            connection.on('data', data => {
                parser.receive(data.toString())
                // 接收完成
                if (parser.isFinished) {
                    resolve(parser.response)
                    connection.end()
                }
            })

            // 接收错误关闭连接
            connection.on('error', err => {
                console.log('err: ', err);
                reject(err)
                connection.end()
            })
        })
    }
}

// 解析HTTP接收到的信息
class ResponseParser {
    constructor() {
        this.WAITING_STATUS_LINE = 0
        this.WAITING_STATUS_LINE_END = 1
        this.WAITING_HEADER_NAME = 2
        this.WAITING_HEADER_SPACE = 3
        this.WAITING_HEADER_VALUE = 4
        this.WAITING_HEADER_LINE_END = 5
        this.WAITING_HEADER_BLOCK_END = 6
        this.WAITING_BODY = 7

        this.current = this.WAITING_STATUS_LINE
        this.statusLine = '' // res的第一行 status line
        this.headers = {}
        this.headerName = ''
        this.headerValue = ''
        this.bodyParser = null // body解析方式由headers中的Content-Type来决定
    }

    get isFinished() {
        return this.bodyParser && this.bodyParser.isFinished
    }

    get response() {
        this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/)
        return {
            statusCode: RegExp.$1,
            statusText: RegExp.$2,
            headers: this.headers,
            body: this.bodyParser.content.join('')
        }
    }

    receive(string) {
        for (let char of string) {
            this.receiveChar(char)
        }
    }

    // \r换行 \n回车
    receiveChar(char) {
        if (this.current === this.WAITING_STATUS_LINE) {
            if (char === '\r') {
                this.current = this.WAITING_STATUS_LINE_END
            } else {
                this.statusLine += char
            }
            return
        }

        if (this.current === this.WAITING_STATUS_LINE_END) {
            if (char === '\n') {
                this.current = this.WAITING_HEADER_NAME
            }
            return
        }

        if (this.current === this.WAITING_HEADER_NAME) {
            if (char === ':') {
                this.current = this.WAITING_HEADER_SPACE
            } else if (char === '\r') {
                this.current = this.WAITING_HEADER_BLOCK_END
                // headers接收完成后，解析body部分
                if (this.headers['Transfer-Encoding'] === 'chunked') {
                    this.bodyParser = new TrunkedBodyParser()
                }
            } else {
                this.headerName += char
            }
            return
        }

        if (this.current === this.WAITING_HEADER_SPACE) {
            if (char === ' ') {
                this.current = this.WAITING_HEADER_VALUE
            }
            return
        }

        if (this.current === this.WAITING_HEADER_VALUE) {
            if (char === '\r') {
                this.current = this.WAITING_HEADER_LINE_END
                this.headers[this.headerName] = this.headerValue
                this.headerName = ''
                this.headerValue = ''
            } else {
                this.headerValue += char
            }
            return
        }

        if (this.current === this.WAITING_HEADER_LINE_END) {
            if (char === '\n') {
                this.current = this.WAITING_HEADER_NAME
            }
            return
        }

        if (this.current === this.WAITING_HEADER_BLOCK_END) {
            if (char === '\n') {
                this.current = this.WAITING_BODY
            }
            return
        }

        if (this.current === this.WAITING_BODY) {
            this.bodyParser.receiveChar(char)
        }
    }
}

// 解析接收到的信息中的body信息
class TrunkedBodyParser {
    constructor() {
        this.WAITING_LENGTH = 0
        this.WAITING_LENGTH_LINE_END = 1
        this.READING_TRUNK = 2
        this.WAITING_NEW_LINE = 3
        this.WAITING_NEW_LINE_END = 4
        this.length = 0
        this.content = []
        this.isFinished = false
        this.current = this.WAITING_LENGTH
    }

    // \r换行 \n回车
    receiveChar(char) {
        if (this.current === this.WAITING_LENGTH) {
            if (char === '\r') {
                if (this.length === 0) {
                    this.isFinished = true
                }
                this.current = this.WAITING_LENGTH_LINE_END
            } else {
                this.length *= 16
                this.length += parseInt(char, 16)
            }
            return
        }

        if (this.current === this.WAITING_LENGTH_LINE_END) {
            if (char === '\n') {
                this.current = this.READING_TRUNK
            }
            return
        }

        if (this.current === this.READING_TRUNK) {
            if (this.length > 0) {
                this.content.push(char)
                this.length--
            }
            if (this.length === 0) {
                this.current = this.WAITING_NEW_LINE
            }
        }

        if (this.current === this.WAITING_NEW_LINE) {
            if (char === '\r') {
                this.current = this.WAITING_NEW_LINE_END
            }
            return
        }

        if (this.current === this.WAITING_NEW_LINE_END) {
            if (char === '\n') {
                this.current = this.WAITING_LENGTH
            }
            return
        }
    }
}

// 发送请求实例
void async function () {
    let request = new Request({
        method: 'POST',
        host: '127.0.0.1',
        port: '3000',
        path: '/',
        headers: {
            ['X-Foo2']: 'customed'
        },
        body: {
            name: 'douzi',
            size: 'big'
        }
    })

    let response = await request.send()

    let dom = parser.parseHTML(response.body)
    // console.log(JSON.stringify(dom, null, '  '));
}();
