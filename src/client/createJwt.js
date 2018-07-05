import fs from 'fs'

import jwt from 'jsonwebtoken'

// Create a Cloud IoT Core JWT for the given project id, signed with the given
// private key.
export default function(projectId, privateKeyFile, algorithm) {
  // Create a JWT to authenticate this device. The device will be disconnected
  // after the token expires, and will have to reconnect with a new token. The
  // audience field should always be set to the GCP project id.

  // projectId = projectId || process.env.PROJECT_ID
  // privateKeyFile = privateKeyFile || process.env.PRIVATE_KEY_FILE
  // algorithm = algorithm || process.env.JWT_ALGORITHM

  const token = {
    iat: parseInt(Date.now() / 1000),
    exp: parseInt(Date.now() / 1000) + 20 * 60, // 20 minutes
    aud: projectId,
  }

  const privateKey = fs.readFileSync(privateKeyFile)

  return jwt.sign(token, privateKey, { algorithm })
}
