const fs = require('fs')
module.exports = fs.readdirSync(__dirname).map(path => require(`./${path}`))
