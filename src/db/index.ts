import {Database} from './database'

const Team = Database('appHe7mDf7oXYgzyj')

export const Staff = Team('Staffs', {view: 'Staff List'})
export const Role = Team('Roles', {view: 'Role List'})
export const Tasks = Team('Tasks', {view: 'Task List'})
