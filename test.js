const test =
  '0.00 Max Amps | -2.19 Avg Amps| 0.66 Avg Voltage| -1.44 Avg Wattage| Cycle Duration: 6.08 seconds| Cycles: 2705'

const f = s => s.replace(/[^0-9\|\.\-]/g, '').split('|')

console.log(f(test))
