import {Database} from './db'

const Team = Database('appHe7mDf7oXYgzyj')

export const Staff = Team('Staff', {view: 'Staff List'})
export const Role = Team('Role')
export const Tasks = Team('Tasks')
