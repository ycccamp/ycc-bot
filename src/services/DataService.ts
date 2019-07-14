import {Application} from '@feathersjs/feathers'

import {Staff, Role, Tasks} from 'utils/table'
import {AirtableService} from 'utils/adapter'

export function DataService(this: Application, app: Application) {
  app.use('staffs', new AirtableService(Staff))
  app.use('roles', new AirtableService(Role))
  app.use('tasks', new AirtableService(Tasks))
}
