# Big CSV

[![NPM Version](https://img.shields.io/npm/v/big-csv.svg?style=flat)](https://www.npmjs.org/package/big-csv)
[![NPM Downloads](https://img.shields.io/npm/dm/big-csv.svg?style=flat)](https://www.npmjs.org/package/big-csv)
[![Node.js Version](https://img.shields.io/badge/node.js->=_7.4-brightgreen.svg?style=flat)](http://nodejs.org/download/)
[![Build Status](http://img.shields.io/travis/cjroth/big-csv.svg?style=flat)](https://travis-ci.org/cjroth/big-csv)
[![Coverage Status](https://img.shields.io/coveralls/cjroth/big-csv.svg?style=flat)](https://coveralls.io/r/cjroth/big-csv)
[![Gittip](http://img.shields.io/gittip/cjroth.svg)](https://www.gittip.com/cjroth/)

An uncomplicated CSV library (parser and serializer) that works with big CSV files. This writes and reads individual lines instead of the entire file so that you don't have to load the entire CSV file into memory. It works at the moment but I'm still hashing out the scalability of it.

## Install
`npm install big-csv` or `yarn add big-csv`

---

```
id,name,weight,description,inventory.amount,inventory.price
1,Apple,23.25,"A red fruit",5,1.25
2,Orange,19.68,"An orange colored round fruit",9,2.30
```

## Reading

```
const CSV = require('big-csv')

let csv = new CSV('fruit.csv')
csv.read().then(console.log)
```

Outputs:
```
[
    {
        "id": 1,
        "name": "Apple",
        "weight": 23.25,
        "description": "A red fruit",
        "inventory": {
            "amount": 5,
            "price": 1.25
        }
    },
    {
        "id": 2,
        "name": "Orange",
        "weight": 19.68,
        "description": "An orange colored round fruit",
        "inventory": {
            "amount": 9,
            "price": 2.30
        }
    }
]
```

## Writing
```
csv.write({
    "id": 3,
    "name": "Watermelon",
    "weight": 100.5,
    "description": "A strange green spherical type blob",
    "inventory": {
        "amount": 9232,
        "price": -252.00
    }
}).then(_ => {
    console.log('wrote object to csv')
})
```

Creates the CSV, using the object's property names as a header, and appends a row to the CSV:
```
3,Watermelon,100.5,"A strange green spherical type blob",9232,-252.00
```
