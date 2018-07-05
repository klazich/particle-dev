const fs = require('fs')
const path = require('path')

const moment = require('moment')

const filepath = path.resolve(__dirname, 'weather.csv')
const data = fs.readFileSync(filepath, 'utf8')

let d = data
  .split('\r\n')
  .map(l => l.split('\t'))
  .map(l => [moment(l[0], 'YYYYMMDDHH'), l[1], l[2]])
// .forEach(e => console.log(e))

// fill gaps

let m = moment('2017010100', 'YYYYMMDDHH')

let a = []

d.forEach(l => {
  while (m.isBefore(l[0])) {
    a = [...a, {dt: m.clone()}]
    m.add(1, 'h')
  }
  a = [...a, {dt: l[0], T: l[1], RH: l[2]}]
  m.add(1, 'h')
})

const outPath = path.resolve(__dirname, 'T-RH.txt')
fs.writeFileSync(outPath, JSON.stringify(a), {encoding: 'utf8'})
