import Datastore from '@google-cloud/datastore';

const projectId = process.env.PROJECT_ID;
const datastore = new Datastore({ projectId });

export default function addReading(subObj) {
  try {
    saveEntity(makeEntity(subObj), datastore);
  } catch (e) {
    console.error(e);
    return -1;
  }
  return 0;
}

export function makeEntity(subObj) {
  // Prepares the new entity
  const { attributes, humidity, temperature } = subObj;

  const key = datastore.key([
    'SHT25',
    attributes.device_id,
    'Reading',
    attributes.published_at,
  ]);
  const data = { humidity, temperature, attributes };

  return {
    key,
    data,
  };
}

export function saveEntity(entity, datastoreInst) {
  datastoreInst
    .save(entity)
    .then(() => {
      console.log(`... an entity was created successfully`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
}
