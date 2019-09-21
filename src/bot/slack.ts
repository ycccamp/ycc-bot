import {App} from '@slack/bolt'
import {safeEval} from 'utils/safe-eval'
import {Tasks} from 'db'

import {debug} from 'utils/logs'

const {SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET} = process.env

export const bot = new App({
  signingSecret: SLACK_SIGNING_SECRET,
  token: SLACK_BOT_TOKEN,
})

const purpleBarberQuotes = [
  'พวกเด็กไม่มีอนาคต​ ไม่มีมารยาท โตไปไหนได้ไม่ไกลหรอก',
  'พิเศษใส่ไข่',
  'ใครเคาะคะ',
]

const jbAngryQuotes = ['หนังหี', 'อยากมีซีนหรอ', ...purpleBarberQuotes]
const jbQuotes = [...jbAngryQuotes, 'ข้า...']

const rand = (list: any[]) => list[Math.floor(Math.random() * list.length)]

bot.message('ด่า', async c => {
  const quote = rand(jbAngryQuotes)

  c.say(quote)
})

bot.command('/jabont', async c => {
  c.ack()

  const quote = rand(jbQuotes)

  c.say(quote)
})

bot.message('โย่', async ({message, say}) => {
  say(`สวัสดีฮะ <@${message.user}>!`)
})

bot.message('time', async ({message, say}) => {
  const date = new Date()

  say(`The time is ${date.getHours()}:${date.getMinutes()}`)
})

bot.message('king', async c => {
  c.say(`ไอ้พวกล้มเจ้า`)
})

bot.message('บอร์ดเกม', async c => c.say('แล่นเรือใบ'))
bot.message('เน็ตใช้ไม่ได้', async c => c.say('เพราะ บอดแบนอินเทอร์เน็ต'))

bot.message('$ airtable:tasks:all', async c => {
  const tasks = await Tasks.find()

  const result = JSON.stringify(tasks, null, 2).trim()

  c.say(result)
})

const taskRegex = /\$ airtable:tasks:(.*)/ms

bot.message(taskRegex, async c => {
  const m = taskRegex.exec(String(c.message.text))
  if (!m || !m[1]) return

  const taskID = m[1]
  const task = await Tasks.get(taskID)

  const result = `
    Task ${taskID} =>

    \`\`\`
      ${JSON.stringify(task, null, 2)}
    \`\`\`
  `

  c.say(result)
})

const delay = (ms: number) => new Promise(resolve => resolve(setTimeout, ms))

bot.command('/eval', async ({say, ack, payload}) => {
  ack()

  say(`Evaluating: ${payload.text}`)

  await delay(1000)

  const result = safeEval(payload.text)

  say(result)
})

bot.command('/ycc', async c => {
  c.ack()

  const {user_id, text} = c.payload

  debug('> /ycc:', c.payload)

  c.say(`สวัสดี <@${user_id}>`)
})

bot.command('/role', async c => {
  c.ack()

  const {text} = c.payload
  debug('> /role:', c.payload)

  c.say('OK.')
})

bot.command('/tasks', async c => {
  c.ack()

  c.say('Retrieving Tasks... Please wait.')

  const tasks = await Tasks.find()
  debug('Tasks:', tasks)

  let output = `Tasks:\n`

  tasks.forEach(task => {
    output += `🦄 ${task.name}\n\n`
  })

  c.say(output)
})
