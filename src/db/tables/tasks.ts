import {BaseFields, Options} from '../types'

export interface Task extends BaseFields {
  name: string
  mcs: string[]
  status: string
  crews: string[]
  deadline: string
  priority: string
}

export const taskOptions: Options<Task> = {
  view: 'Task List',

  fields: {
    name: 'ชื่อของงาน',
    mcs: 'MC ผู้ดูแลรับผิดชอบ',
    status: 'สถานะของงาน',
    crews: 'คนที่รับงานไปทำ',
    deadline: 'ต้องเสร็จก่อนวันที่',
    priority: 'ความสำคัญ'
  },

  async transform(item) {
    return item
  }
}
