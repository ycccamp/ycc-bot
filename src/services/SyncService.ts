import {Application} from '@feathersjs/feathers'
import {BadRequest} from '@feathersjs/errors'

import {Table} from 'db/database'

export class SyncService {
  app: Application = {}

  setup(app: Application) {
    this.app = app
  }

  async create(payload) {
    const {service, action} = payload
    const s = this.app.service(service)

    if (s) {
      const table = s.table as Table
      if (!table) throw new BadRequest('Not an Airtable service!')

      if (action === 'invalidate') {
        await table.cache.clear()
        return {status: 'Invalidated Cache'}
      }

      if (action === 'sync') {
        await table.sync()
        return {status: 'Synchronized Cache'}
      }
    }

    throw new BadRequest('Service Not Found')
  }
}
