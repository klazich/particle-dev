/**
 * This application demonstrates how programatically grant access to the Google
 * Cloud IoT Core service account on a given PubSub topic.
 *
 * For more information, see https://cloud.google.com/iot.
 */

// let topic = 'device-events'
// setTopicPolicy(topic)

function setTopicPolicy(topicName) {
  // Imports the Google Cloud client library
  const PubSub = require('@google-cloud/pubsub')

  // Instantiates a client
  const pubsub = PubSub()

  // References an existing topic, e.g. "my-topic"
  const topic = pubsub.topic(topicName)

  // The new IAM policy
  const serviceAccount = 'serviceAccount:cloud-iot@system.gserviceaccount.com'

  topic.iam
    .getPolicy()
    .then(results => {
      const policy = results[0] || {}
      policy.bindings || (policy.bindings = [])
      console.log(JSON.stringify(policy, null, 2))

      let hasRole = false
      let binding = {
        role: 'roles/pubsub.publisher',
        members: [serviceAccount],
      }

      policy.bindings.forEach(_binding => {
        if (_binding.role === binding.role) {
          binding = _binding
          hasRole = true
          return false
        }
      })

      if (hasRole) {
        binding.members || (binding.members = [])
        if (binding.members.indexOf(serviceAccount) === -1) {
          binding.members.push(serviceAccount)
        }
      } else {
        policy.bindings.push(binding)
      }

      // Updates the IAM policy for the topic
      return topic.iam.setPolicy(policy)
    })
    .then(results => {
      const updatedPolicy = results[0]

      console.log(JSON.stringify(updatedPolicy, null, 2))
    })
    .catch(err => {
      console.error('ERROR:', err)
    })
}

if (module === require.main) {
  setTopicPolicy(process.argv[2])
}
