import {Application} from '@feathersjs/feathers'

import {Staffs, Roles, Tasks} from 'db'
import {Service} from 'db/service'

import {SyncService} from './SyncService'

export function DataService(this: Application, app: Application) {
  app.use('sync', new SyncService())

  app.use('staffs', new Service(Staffs))
  app.use('roles', new Service(Roles))
  app.use('tasks', new Service(Tasks))
}
