import PubSub from '@google-cloud/pubsub';

const pubsub = new PubSub();

// subscription names
const humidity = 'humidity';
const temperature = 'temperature';

export default function(subscriptionName) {
  subscription = pubsub.subscription(subscriptionName);
}

const subHumidity = pubsub.subscription(humidity);
const subTemperature = pubsub.subscription(temperature);

// handle message logging
let messageCount = 0;
const messageLogger = message => {
  console.log(`Subscription: ${message.attributes.event}`);
  console.log(`Received message ${message.id}:`);
  console.log(`\tData: ${message.data}`);
  console.log(`\tAttributes: ${message.attributes.keys}`);
  messageCount += 1;
};

// Create an event handler to handle messages
const messageHandler = message => {
  // "Ack" (acknowledge receipt of) the message
  message.ack();
};

// Listen for new messages until timeout is hit
subHumidity.on(`message`, messageHandler);
subTemperature.on(`message`, messageHandler);

setTimeout(() => {
  subHumidity.removeListener('message', messageHandler);
  subTemperature.removeListener('message', messageHandler);
  console.log(`${messageCount} message(s) received.`);
}, timeout * 1000);
