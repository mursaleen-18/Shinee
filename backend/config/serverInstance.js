import crypto from 'crypto'

// Generate a new instance id at server start - this changes on every restart.
const instanceId = crypto.randomBytes(16).toString('hex')
export default instanceId
