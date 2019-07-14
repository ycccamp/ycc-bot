import {Application} from '@feathersjs/feathers'

import {Staff, Role, Tasks} from 'db'
import {Service} from 'db/service'

export function DataService(this: Application, app: Application) {
  app.use('staffs', new Service(Staff))
  app.use('roles', new Service(Role))
  app.use('tasks', new Service(Tasks))
}
