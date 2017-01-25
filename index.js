const fs = require('fs')
const path = require('path')
const readline = require('readline')
const EventEmitter = require('events')
const dottie = require('dottie')

module.exports = class CSV extends EventEmitter {

    constructor(filepath, options = { flags: 'a', header: 1 }) {
        super()
        this.options = options
        this.filepath = path.resolve(filepath)
        this.readStream = fs.createReadStream(this.filepath)
        this.writeStream = null
        this.header = null
        this.data = []
        this.read()
        this.writeStream = fs.createWriteStream(this.filepath, {
            flags: this.options.flags,
            start: fs.statSync(this.filepath).size
        })
    }

    read() {
        let lineReader = readline.createInterface({
            input: this.readStream
        })
        let index = 0
        this.data.length = 0
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
        lineReader.on('close', this.emit.bind(this, 'read', this.data))
    }

    write(object) {
        if (!this.header) {
            this.header = dottie.paths(object).sort()
            this.writeStream.write(`${this.header.join(',')}\n`)
        }
        let row = []
        for (let i in this.header) {
            let column = this.header[i]
            let value = dottie.get(object, column)
            if (typeof value === 'string') {
                let escaped = value
                    .replace(/\"/g, '\\"')
                    .replace(/\n/, '\\n')
                    .replace(/,/, '\,')
                value = `"${value.replace(/\"/, '\\"')}"`
            }
            row.push(value)
        }
        this.writeStream.write(`${row.join(',')}\n`)
        this.length++
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
