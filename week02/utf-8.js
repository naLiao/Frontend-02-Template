function UTF8_Encoding(str) {
    if (typeof str !== 'string') return
    let chunks = []
    let size = 0
    for (var i = 0; i < str.length; i++) {
        let currnetCharCode = str.charCodeAt(i)  // 当前字符的Unicode编码
        console.log('currnetCharCode: ', currnetCharCode);
        if (currnetCharCode >= 0 && currnetCharCode <= 127) { // 字符是否属于ASCII，转为一个字节
            chunks.push(currnetCharCode)
            size += 1
        }
        if (currnetCharCode >= 128 && currnetCharCode <= 2047) { // 转化为两个字节
            chunks.push(192 | (31 & currnetCharCode >> 6))
            chunks.push(128 | (63 & currnetCharCode))
            size += 2
        }
        if (currnetCharCode >= 2048 && currnetCharCode <= 0xFFFF) { // 转化为三个字节
            chunks.push(224 | (15 & currnetCharCode >> 12))
            chunks.push(128 | (63 & currnetCharCode >> 6))
            chunks.push(128 | (63 & currnetCharCode))
            size += 3
        }
    }
    chunks = chunks.map(item => item.toString(16))
    return chunks
}

console.log(UTF8_Encoding('你好世界'))