/**
 * Triggered from a message to the "sht25" topic.
 */
exports.subscribe = (event, callback) => {
  // The Cloud Pub/Sub Message object.
  const pubsubMessage = event.data

  // parse the data into a javascript object
  const data = Buffer.from(pubsubMessage.data, 'base64')
    .toString()
    .split('\n')
    .map(e => e.split(','))
    .reduce((acc, cur) => {
      acc[cur[0].trim()] = parseFloat(cur[1].trim())
      return acc
    }, {})

  // the response object
  const res = {
    topic: 'sht25',
    event: 'reading',
    attributes: pubsubMessage.attributes,
    data: [
      {
        type: 'humidity',
        unit: 'RH',
        value: data.humidity,
      },
      {
        type: 'temperature',
        unit: 'C',
        value: data.temperature,
      },
      {
        type: 'temperature',
        unit: 'F',
        value: celsiusToFahrenheit(data.temperature),
      },
    ],
  }

  console.log(JSON.stringify(res))

  callback()
}

function celsiusToFahrenheit(temp_C) {
  temp_F = temp_C * (9 / 5) + 32
  return temp_F
}
