import PubSub from '@google-cloud/pubsub';

// Your Google Cloud Platform project ID
const projectId = process.env.PROJECT_ID;
// Creates the PubSub client
const pubsub = new PubSub({
  projectId,
});

// PubSub names
const topicName = 'sht25';
const subscriptionName = 'sht25';

// References an existing subscription
const topic = pubsub.topic(topicName);
const subscription = topic.subscription(subscriptionName);

let count = 0;

// Register an error handler.
subscription.on('error', err => {
  console.log(err);
});

// Register a listener for `message` events.
function onMessage(message) {
  /**
   * message.id ........... ID of the message.
   * message.ackId ........ ID used to acknowledge the message received.
   * message.data ......... Contents of the message.
   * message.attributes ... Attributes of the message.
   */

  let dataBuf = Buffer.from(message.data);
  let data = {
    id: message.id,
    at: message.attributes.published_at,
    ...JSON.parse(dataBuf.toString('utf8')),
  };

  console.dir(data);
  console.log('\n');

  // do stuff with message

  // Ack the message:
  message.ack();

  count += 1;

  if (count > 10) {
    subscription.removeListener('message', onMessage);
    console.log('------>    listener removed');
  }
}
subscription.on('message', onMessage);
console.log('------>    listener added');
