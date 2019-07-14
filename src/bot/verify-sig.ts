import crypto from 'crypto'
import tsscmp from 'tsscmp'
import {BadRequest} from '@feathersjs/errors'

import {Request, Response} from 'express'
import {wtf, debug} from 'utils/logs'

/**
 * This request handler has two responsibilities:
 * - Verify the request signature
 * - Parse request.body and assign the successfully parsed object to it.
 */

const {SLACK_SIGNING_SECRET = ''} = process.env

export async function verifySignatureAndParseBody(
  req: Request,
  res: Response,
  next: Function,
) {
  console.log(req.body, req.headers, req.params)

  if (req.body && req.body.ssl_check) {
    res.send()

    return
  }

  try {
    const signature = req.headers['x-slack-signature'] as string
    const ts = Number(req.headers['x-slack-request-timestamp'])
    const stringBody = JSON.stringify(req.body)

    try {
      await verifyRequestSignature(
        SLACK_SIGNING_SECRET,
        stringBody,
        signature,
        ts,
      )
    } catch (error) {
      wtf('Signature Verification Error', error.message)

      return next(error)
    }

    if (req.body && req.body.type && req.body.type === 'url_verification') {
      debug('> Signature OK!')

      res.json({challenge: req.body.challenge})

      return
    }

    next()
  } catch (error) {
    wtf('Signature Verification Error', error.message)

    next(error)
  }
}

// TODO: this should be imported from another package
async function verifyRequestSignature(
  signingSecret: string,
  body: string,
  signature: string,
  requestTimestamp: number,
): Promise<void> {
  if (!signature || !requestTimestamp) {
    throw new BadRequest(
      'Slack request signing verification failed. Some headers are missing.',
    )
  }

  // Divide current date to match Slack ts format
  // Subtract 5 minutes from current time
  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5

  if (requestTimestamp < fiveMinutesAgo) {
    throw new BadRequest(
      'Slack request signing verification failed. Timestamp is too old.',
    )
  }

  const hmac = crypto.createHmac('sha256', signingSecret)
  const [version, hash] = signature.split('=')
  hmac.update(`${version}:${requestTimestamp}:${body}`)

  if (!tsscmp(hash, hmac.digest('hex'))) {
    const error = new BadRequest(
      'Slack request signing verification failed. Signature mismatch.',
    )
    throw error
  }
}
