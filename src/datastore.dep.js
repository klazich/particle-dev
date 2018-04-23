// import colors from 'colors';
// import util from 'util';
// import Google from 'google-cloud';
// import * as config from './gcp_private_key.json'

const Datastore = require('@google-');

_checkConfig();

console.log('Authenticating with Google Cloud...');

const gcloud = Google({
  projectId: config.projectId,
  keyFilename: config.gcpServiceAccountKeyFilePath,
});

console.log(colors.magenta('Authentication successful'));

const datastore = gcloud.datastore();
const pubsub = gcloud.pubsub();

const subscription = pubsub.subscription(config.gcpPubSubSubscriptionName);

function storeEvent(message) {
  const key = datastore.key('ParticleEvent');

  datastore.save(
    {
      key: key,
      data: _createEventObjectForStorage(message),
    },
    err => {
      err
        ? console.log(colors.red('There was an error storing the event'), err)
        : console.log(
            colors.green('Particle event stored in Datastore\r\n'),
            _createEventObjectForStorage(message, true)
          );
    }
  );
}

subscription.on('message', message => {
  console.log(
    colors.cyan('Particle event received from Pub/Sub\r\n'),
    _createEventObjectForStorage(message, true)
  );
  // Called every time a message is received.
  // message.id = ID used to acknowledge its receival.
  // message.data = Contents of the message.
  // message.attributes = Attributes of the message.
  storeEvent(message);
  message.ack();
});

function _checkConfig() {
  if (config.gcpProjectId === '' || !config.gcpProjectId) {
    console.log(
      colors.red(
        'You must set your Google Cloud Platform project ID in datastore.js'
      )
    );
    process.exit(1);
  }
  if (
    config.gcpPubSubSubscriptionName === '' ||
    !config.gcpPubSubSubscriptionName
  ) {
    console.log(
      colors.red(
        'You must set your Google Cloud Pub/Sub subscription name in datastore.js'
      )
    );
    process.exit(1);
  }
}

function _createEventObjectForStorage(message, log) {
  var obj = {
    gc_pub_sub_id: message.id,
    device_id: message.attributes.device_id,
    event: message.attributes.event,
    data: message.data,
    published_at: message.attributes.published_at,
  };

  return log ? colors.grey(util.inspect(obj)) : obj;
}
