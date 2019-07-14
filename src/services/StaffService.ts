import {Staff} from 'utils/table'

class StaffService {
  async find() {
    return Staff.find()
  }

  async get(id: string) {
    return Staff.get(id)
  }
}

export function staff(app) {
  app.use('staff', new StaffService())
}
