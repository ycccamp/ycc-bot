import 'dotenv/config'

import {Request, Response} from 'express'
import feathers from '@feathersjs/feathers'
import express from '@feathersjs/express'

import {info} from 'utils/logs'
import {hooksProvider} from 'middleware/hooks-provider'

import {DataService} from 'services/DataService'

const {PORT} = process.env

export const app = express(feathers())

// Turn on JSON body parsing for REST services
app.use(express.json())

// Turn on URL-encoded body parsing for REST services
app.use(express.urlencoded({extended: true}))

// Set up REST transport using Express
app.configure(express.rest())

app.use(hooksProvider)

const IndexRoute = async (_req: Request, res: Response) =>
  res.send({status: 'OK!'})

app.get('/', IndexRoute)
app.configure(DataService)

// Set up an error handler that gives us nicer errors
const errorHandler = express.errorHandler({
  // json(error: FeathersError, _req: Request, res: Response, next: Function) {
  //   wtf(`HTTP Error ${error.code} (${error.name}):`, error.message)
  //
  //   res.sendStatus(error.code)
  //   next()
  // },
})

app.use(errorHandler)

app.listen(PORT, () => {
  info(`Starting server at port ${PORT}.`)
})
