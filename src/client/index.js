import mqtt from 'mqtt'

import config from './config'
import createJwt from './createJwt'

// The mqttClientId is a unique string that identifies this device. For Google
// Cloud IoT Core, it must be in the format below.
const mqttClientId = `projects/${config.PROJECT_ID}/locations/${
  config.CLOUD_REGION
}/registries/${config.REGISTRY_ID}/devices/${config.DEVICE_ID}`

// With Google Cloud IoT Core, the username field is ignored, however it must be
// non-empty. The password field is used to transmit a JWT to authorize the
// device. The "mqtts" protocol causes the library to connect using SSL, which
// is required for Cloud IoT Core.
const token = createJwt(
  config.PROJECT_ID,
  config.PRIVATE_KEY_FILE,
  config.JWT_ALGORITHM
)
let connectionArgs = {
  host: config.MQTT_BRIDGE_HOSTNAME,
  port: config.MQTT_BRIDGE_PORT,
  clientId: mqttClientId,
  username: 'unused',
  password: token,
  protocol: 'mqtts',
  secureProtocol: 'TLSv1_2_method',
}

// Create a client, and connect to the Google MQTT bridge.
global.iatTime = parseInt(Date.now() / 1000)
global.client = mqtt.connect(connectionArgs)

// Subscribe to the /devices/{device-id}/config topic to receive config updates.
client.subscribe(`/devices/${config.DEVICE_ID}/config`)

// The MQTT topic that this device will publish data to. The MQTT
// topic name is required to be in the format below. The topic name must end in
// 'state' to publish state and 'events' to publish telemetry. Note that this is
// not the same as the device registry's Cloud Pub/Sub topic.
global.mqttTopic = `/devices/${config.DEVICE_ID}/${config.MESSAGE_TYPE}`

import { publishAsync } from './publish'

// client event hooks
client.on('connect', success => {
  console.log('connection open')
  if (!success) {
    console.log('Client not connected...')
  } else if (!publishChainInProgress) {
    publishAsync(1, config.NUM_MESSAGES)
  }
})

client.on('close', () => {
  console.log('=> connection closed')
  shouldBackoff = true
})

client.on('error', err => {
  console.log('error', err)
})

client.on('message', (topic, message, packet) => {
  console.log(
    'message received: ',
    Buffer.from(message, 'base64').toString('ascii')
  )
})

client.on('packetsend', () => {
  // Note: logging packet send is very verbose
})

// Once all of the messages have been published, the connection to Google Cloud
// IoT will be closed and the process will exit. See the publishAsync method.
