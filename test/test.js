const fs = require('fs')
const assert = require('assert')
const path = require('path')
const CSV = require('../index')

const jsonPath = path.resolve('./test/fixtures/fruit.json')
const csvPath = path.resolve('./test/fixtures/fruit.csv')
const tmpPath = path.resolve('./tmp/fruit.csv')

const json = JSON.parse(fs.readFileSync(jsonPath))

var data, csv

before(done => {
    csv = new CSV(csvPath)
    csv.on('read', fruit => {
        data = fruit
        done()
    })
})

describe('CSV', _ => {
    describe('read', _ => {

        it('should read a csv into a json object', done => {
            assert.deepEqual(data[0], json[0])
            done()
        })

        it('should read the header', done => {
            assert.deepEqual(csv.header, [
                'id',
                'name',
                'weight',
                'description',
                'inventory.amount',
                'inventory.price',
                'inventory.date',
                'inventory.manager'
            ])
            done()
        })

    })

    describe('write', _ => {
        it('should append objects as lines to the csv', _ => {
            let tmpCsv = new CSV(tmpPath)
            tmpCsv.write({
                string: 'apples, oranges, and grapefruit',
                integer: 3,
                float: 1.2,
                quotedString: '"They\'re going to eat lots of \"fruit.\""',
                null: null,
                emptyString: '',
                nested: {
                    item1: 'apple',
                    item2: 'orange'
                }
            })
            let header = 'emptyString,float,integer,nested.item1,nested.item2,quotedString,string'
            let row = '"",1.2,3,"apple","orange","They\'re going to eat lots of apples, oranges, and grapefruit"'
            let rawData = fs.readFileSync(tmpPath).toString().split('\n')
            assert(rawData[0], header)
            assert(rawData[1], row)
        })
    })

})
