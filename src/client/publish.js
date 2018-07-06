import config from './config'

// Whether to wait with exponential backoff before publishing.
global.shouldBackoff = false

// The current backoff time.
global.backoffTime = 1

// Whether an asynchronous publish chain is in progress.
global.publishChainInProgress = false

// Publish numMessages messages asynchronously, starting from message
// messagesSent.
export function publishAsync(messagesSent, numMessages) {
  // If we have published enough messages or backed off too many times, stop.
  if (
    messagesSent > numMessages ||
    backoffTime >= config.MAXIMUM_BACKOFF_TIME
  ) {
    if (backoffTime >= config.MAXIMUM_BACKOFF_TIME) {
      console.log('Backoff time is too high. Giving up.')
    }
    console.log('Closing connection to MQTT. Goodbye!')
    client.end()
    publishChainInProgress = false
    return
  }

  // Publish and schedule the next publish.
  publishChainInProgress = true
  var publishDelayMs = 0
  if (shouldBackoff) {
    publishDelayMs = 1000 * (backoffTime + Math.random())
    backoffTime *= 2
    console.log(`Backing off for ${publishDelayMs}ms before publishing.`)
  }
  setTimeout(function() {
    // data payload pushed to topic ///////////////////////////////////////////
    const payload = `${config.REGISTRY_ID}/${
      config.DEVICE_ID
    }-payload-${messagesSent}`
    ///////////////////////////////////////////////////////////////////////////

    // Publish "payload" to the MQTT topic. qos=1 means at least once delivery.
    // Cloud IoT Core also supports qos=0 for at most once delivery.
    console.log('Publishing message:', payload)
    client.publish(mqttTopic, payload, { qos: 1 }, function(err) {
      if (!err) {
        shouldBackoff = false
        backoffTime = config.MINIMUM_BACKOFF_TIME
      }
    })

    var schedulePublishDelayMs = config.MESSAGE_TYPE === 'events' ? 1000 : 2000
    setTimeout(function() {
      // [START iot_mqtt_jwt_refresh]
      let secsFromIssue = parseInt(Date.now() / 1000) - iatTime
      if (secsFromIssue > config.TOKEN_EXP_MINS * 60) {
        iatTime = parseInt(Date.now() / 1000)
        console.log(`\tRefreshing token after ${secsFromIssue} seconds.`)

        client.end()
        connectionArgs.password = createJwt(
          config.PROJECT_ID,
          config.PRIVATE_KEY_FILE,
          config.JWT_ALGORITHM
        )
        client = mqtt.connect(connectionArgs)

        client.on('connect', success => {
          console.log('connect')
          if (!success) {
            console.log('Client not connected...')
          } else if (!publishChainInProgress) {
            publishAsync(1, config.NUM_MESSAGES)
          }
        })

        client.on('close', () => {
          console.log('close')
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
      }
      // [END iot_mqtt_jwt_refresh]
      publishAsync(messagesSent + 1, numMessages)
    }, schedulePublishDelayMs)
  }, publishDelayMs)
}
