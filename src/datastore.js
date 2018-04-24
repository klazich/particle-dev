import Datastore from '@google-cloud/datastore';

// Your Google Cloud Platform project ID
const projectId = process.env.PROJECT_ID;

// Creates the Datastore client
const datastore = new Datastore({ projectId });

// The kind for the new entity
const kind = 'HT_Reading';
// The name/ID for the new entity
const name = 'id';
// The Cloud Datastore key for the new entity
const taskKey = datastore.key([kind, name]);

// Prepares the new entity
const task = {
  key: taskKey,
  data: {
    description: 'Buy milk',
  },
};

function makeKey(data)

function makeEntity(data) {
  return {

  }
}

// Saves the entity
datastore
  .save(task)
  .then(() => {
    console.log(`Saved ${task.key.name}: ${task.data.description}`);
  })
  .catch(err => {
    console.error('ERROR:', err);
  });
