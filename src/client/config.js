export default {
  PROJECT_ID: process.env.PROJECT_ID,
  CLOUD_REGION: process.env.CLOUD_REGION,
  REGISTRY_ID: process.env.REGISTRY_ID,
  DEVICE_ID: process.env.DEVICE_ID,
  PRIVATE_KEY_FILE: process.env.PRIVATE_KEY_FILE,
  JWT_ALGORITHM: process.env.JWT_ALGORITHM,
  NUM_MESSAGES: process.env.NUM_MESSAGES,
  TOKEN_EXP_MINS: process.env.TOKEN_EXP_MINS,
  MQTT_BRIDGE_HOSTNAME: process.env.MQTT_BRIDGE_HOSTNAME,
  MQTT_BRIDGE_PORT: process.env.MQTT_BRIDGE_PORT,
  MESSAGE_TYPE: process.env.MESSAGE_TYPE,

  // The initial backoff time after a disconnection occurs, in seconds.
  MINIMUM_BACKOFF_TIME: 1,

  // The maximum backoff time before giving up, in seconds.
  MAXIMUM_BACKOFF_TIME: 32,
}
