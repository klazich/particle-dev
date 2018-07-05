const Datastore = require('@google-cloud/datastore')

const datastore = new Datastore({})

exports.funcPubSub = (event, callback) => {
  const pubsubMessage = event.data

  const {
    device_id,
    published_at,
    event: event_trigger,
  } = pubsubMessage.attributes
  const data = Buffer.from(pubsubMessage.data, 'base64').toString()

  console.log(pubsubMessage.attributes)
  console.log(data)

  const key = datastore.key({
    namespace: device_id,
    path: [''],
  })

  callback()
}

// exports.addDevice = event => {
//   const Datastore = require('@google-cloud/datastore');
//   const datastore = new Datastore();

//   const message = event.data;

//   const entityKey = datastore.key({
//     namespace: message.attributes.device_id,
//     path: ['reading', message.attributes.published_at],
//   });

//   const data = Buffer.from(message.data, 'base64').toString();
// };

// sprintf(publishData, "%0.2f Max Amps | %0.2f Avg Amps| %0.2f Avg Voltage| %0.2f Avg Wattage| Cycle Duration: %0.2f seconds| Cycles: %i", maxExtendReading, avgCurrent, avgVoltage, avgWattage, cycleDuration, cyclesCount);
