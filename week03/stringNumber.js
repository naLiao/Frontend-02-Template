function numberToString(num, format = 10) {
    if (typeof num !== 'number' || typeof format !== 'number') return

    if ([2, 8, 16].includes(format)) {
        return formatChange(num, format)
    } else {
        return (num).toString()
    }
}

// 十进制数字与其他进制转换
function formatChange(num, format) {
    let str = (num).toString(format)
    let prefixMap = {
        2: '0b',
        8: '0o',
        16: '0x'
    }

    let prefix = prefixMap[format]
    return prefix ? prefix + str : str
}

function stringToNumber(str) {
    if (typeof str !== 'string') return
    return Number(str)
}

console.log(numberToString(10, 16), typeof numberToString(10, 16))  // 0xa string
console.log(stringToNumber('0xe6'), typeof stringToNumber('0xe6')) // 230 number
