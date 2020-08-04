const http = require('http')
const fs = require('fs')

const html = fs.readFileSync('./index.html')

http.createServer((req, res) => {
    let body = []
    req
        .on('error', err => {
            console.log('err: ', err);
        })
        .on('data', chunk => {
            console.log('chunk: ', chunk);
            body.push(chunk)
        })
        .on('end', () => {
            body = Buffer.concat(body).toString()
            console.log('body: ', body);
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.end(`${html}`)
        })
}).listen(3000)

console.log('server started')