const fs = require('fs')
const path = require('path')
const readline = require('readline')
const dottie = require('dottie')

module.exports = class CSV {

    constructor(filepath, options = { flags: 'a', header: 1 }) {
        this.options = options
        this.filepath = path.resolve(filepath)
        this.fd = fs.closeSync(fs.openSync(this.filepath, this.options.flags))
        this.readStream = fs.createReadStream(this.filepath)
        this.writeStream = null
        this.header = null
        this.data = []
        this.writeStream = fs.createWriteStream(this.filepath, {
            flags: this.options.flags,
            start: fs.statSync(this.filepath).size
        })
    }

    read() {
        return new Promise((resolve, reject) => {
            let lineReader = readline.createInterface({
                input: this.readStream
            })
            let index = 0
            this.data = []
            lineReader.on('line', line => {
                if (index === 0) {
                    this.header = this.parseLine(line)
                }
                if (index >= this.options.header) {
                    let row = this.formatLine(this.parseLine(line))
                    this.data.push(row)
                }
                index++
            })
            lineReader.on('close', _ => {
                resolve(this.data)
            })
        })
    }

    writeHeader(arrayHeader) {
        return new Promise((resolve, reject) => {
            this.header = arrayHeader
            this.writeStream.write(`${this.header.join(',')}\n`, error => {
                if (error) {
                    reject(error)
                } else {
                    resolve()
                }
            })
        })
    }

    writeRow(object) {
        return new Promise((resolve, reject) => {
            let row = []
            for (let i in this.header) {
                let column = this.header[i]
                let value = dottie.get(object, column)
                if (typeof value === 'string') {
                    value = `"${value.replace(/"/g, '\\"')}"`
                }
                row.push(value)
            }
            this.writeStream.write(`${row.join(',')}\n`, error => {
                if (error) {
                    reject(error)
                } else {
                    this.length++
                    resolve()
                }
            })
        })
    }

    write(object, done) {
        let result = Promise.resolve()
        if (!this.header) {
            let header = dottie.paths(object).sort()
            result = this.writeHeader(header)
        }
        result.then(_ => {
            return this.writeRow(object)
        })
        return result
    }

    empty() {
        fs.truncateSync(this.filepath, 0)
    }

    formatLine(array) {
        let object = {}
        for (let index in this.header) {
            let columnName = this.header[index]
            object[columnName] = array[index]
        }
        return dottie.transform(object)
    }

    parseLine(line) {
        line = Buffer.from(line)
        if (line[line.length - 1] !== 10) {
            line = Buffer.concat([line, Buffer.from('\n')])
        }
        let data = []
        let value = null
        let escape = null
        let enter = false
        for (let i in line) {
            let index = parseInt(i)
            let charCode = line[index]
            let char = String.fromCharCode(charCode)
            // console.log(char, escape === index, enter) // useful for debugging...
            if (charCode === 92) { // \ (backslash)
                escape = index + 1
                continue
            }
            if (enter) {
                if (escape !== index && charCode === 34) {
                    enter = false
                    continue
                }
                value += char
                continue
            } else {
                if (escape !== index && charCode === 34) { // " (double quote)
                    enter = true
                    value = ''
                    continue
                }
                if (charCode === 44 || charCode === 10) { // , (comma), \n (newline)
                    data.push(this.parseValue(value))
                    value = null
                    continue
                }
                value = value || ''
                value += char
            }
        }
        if (enter) {
            throw new Error('unexpected end of line')
        }
        return data
    }

    parseValue(value) {
        if (/^\d+$/.test(value)) {
            return parseInt(value)
        } else if (/^[+-]?\d+\.?\d+$/.test(value)) {
            return parseFloat(value)
        } else if (typeof value === 'string') {
            return value.trim()
        } else {
            return value
        }
    }

}
