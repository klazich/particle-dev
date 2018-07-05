import PubSub from '@google-cloud/pubsub'

import addReading from './datastore.js'

const projectId = process.env.PROJECT_ID
const pubsub = new PubSub({ projectId })

// PubSub names
const topicName = 'sht25'
const subscriptionName = 'sht25'

// References an existing subscription
const topic = pubsub.topic(topicName)
const subscription = topic.subscription(subscriptionName)

let count = 0

// Register an error handler
subscription.on('error', err => {
  console.log(err)
})

// Register the subscription handler
subscription.on('message', onMessage)
console.log('==> listener added')

// Register a listener for `message` events.
function onMessage(message) {
  /**
   * message.id ........... ID of the message.
   * message.ackId ........ ID used to acknowledge the message received.
   * message.data ......... Contents of the message.
   * message.attributes ... Attributes of the message.
   */

  let data

  try {
    let dataBuf = Buffer.from(message.data)
    data = {
      attributes: message.attributes,
      ...JSON.parse(dataBuf.toString('utf8')),
    }
  } catch (error) {
    data = error
  }

  console.log('... a subscription was received')

  addReading(data)

  message.ack() // Ack the message

  count += 1

  if (count > 10) {
    subscription.removeListener('message', onMessage)
    console.log('==> listener removed')
  }
}
