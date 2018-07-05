/**
 * Triggered from a message to the "mc001" topic.
 */
exports.subscribe = (event, callback) => {
  // The Cloud Pub/Sub Message object.
  const pubsubMessage = event.data

  // parse and clean the event data
  const data = Buffer.from(pubsubMessage.data, 'base64')
    .toString()
    .replace(/[^0-9\|\.\-]/g, '')
    .split('|')

  const particleEvent = pubsubMessage.attributes.event

  // the response object
  const res = {
    topic: 'mc001',
    event: particleEvent,
    attributes: pubsubMessage.attributes,
    data: [
      {
        type: 'maximum current',
        uom: 'Ampere',
        symbol: ['I'],
        value: parseFloat(data[0]),
      },
      {
        type: 'average current',
        uom: 'Ampere',
        symbol: ['I'],
        value: parseFloat(data[1]),
      },
      {
        type: 'average voltage',
        uom: 'Volt',
        symbol: ['V'],
        value: parseFloat(data[2]),
      },
      {
        type: 'average power',
        uom: 'Watt',
        symbol: ['W'],
        value: parseFloat(data[3]),
      },
      {
        type: 'cycle duration',
        uom: 'Millisecond',
        symbol: 'ms',
        value: Math.round(parseFloat(data[4]) * 1000),
      },
      {
        type: 'count of cycles',
        value: parseInt(data[5]),
      },
    ],
  }

  console.log(JSON.stringify(res))

  callback()
}

// "0.00 Max Amps | -2.19 Avg Amps| 0.66 Avg Voltage| -1.44 Avg Wattage| Cycle Duration: 6.08 seconds| Cycles: 2705"
// maxExtendReading, avgCurrent, avgVoltage, avgWattage, cycleDuration, cyclesCount
// max_amps
// avg_amps
// avg_voltage
// avg_wattage
// cycle_duration
// cycles_count
