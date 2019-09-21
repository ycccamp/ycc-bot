import {Database} from './database'

import {taskOptions} from './tables/tasks'

const Team = Database('appHe7mDf7oXYgzyj')

export const Staffs = Team('Staffs', {view: 'Staff List'})

export const Roles = Team('Roles', {view: 'Role List'})

export const Tasks = Team('Tasks', taskOptions)
