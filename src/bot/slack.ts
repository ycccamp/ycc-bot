import {App} from '@slack/bolt'
import both from 'ramda/es/both';

const {SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET} = process.env

export const bolt = new App({
  signingSecret: SLACK_SIGNING_SECRET,
  token: SLACK_BOT_TOKEN,
})

bolt.event('')