import twilio from 'twilio'

import config from '../config.js'
import logger from './log.js'

const client = twilio(config.twilio.accountSID, config.twilio.authToken)

const call = () => {
  for (const number of config.twilio.toNumbers) {
    client.calls
      .create({
        twiml: '<Response><Say>X has a message!</Say></Response>',
        to: number,
        from: config.twilio.fromNumber,
      })
      .then((call) => logger.debug('Successfully made call to %s (%s)', number, call.sid))
      .catch((error) => logger.error('Failed to call %s: %d - %s', number, error.code, error.message))
  }
}

export default call
