# Reasonable CSV

[![NPM Version](https://img.shields.io/npm/v/reasonable-csv.svg?style=flat)](https://www.npmjs.org/package/reasonable-csv)
[![NPM Downloads](https://img.shields.io/npm/dm/reasonable-csv.svg?style=flat)](https://www.npmjs.org/package/reasonable-csv)
[![Node.js Version](https://img.shields.io/badge/node.js->=_7.4-brightgreen.svg?style=flat)](http://nodejs.org/download/)
[![Build Status](http://img.shields.io/travis/cjroth/reasonable-csv.svg?style=flat)](https://travis-ci.org/cjroth/reasonable-csv)
[![Coverage Status](https://img.shields.io/coveralls/cjroth/reasonable-csv.svg?style=flat)](https://coveralls.io/r/cjroth/reasonable-csv)
[![Gittip](http://img.shields.io/gittip/cjroth.svg)](https://www.gittip.com/cjroth/)

A reasonable CSV reader and writer. It's not too complicated, but it has everything you need. ES6. Only one dependency. Writes and reads one line at a time so you can read and append as data becomes available.

## Install
`npm install reasonable-csv` or `yarn add reasonable-csv`

---

```
id,name,weight,description,inventory.amount,inventory.price
1,Apple,23.25,"A red fruit",5,1.25
2,Orange,19.68,"An orange colored round fruit",9,2.30
```

## Reading

```
const CSV = require('reasonable-csv')
let csv = new CSV('fruit.csv')
csv.on('read', console.log)
// outputs...
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
})
// appends...
3,Watermelon,100.5,"A strange green spherical type blob",9232,-252.00
```
