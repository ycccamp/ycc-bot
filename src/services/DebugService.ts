import {Staff} from 'utils/table'

class DebugService {
  async find() {
    const data = await Staff.find()

    return {data, hello: true}
  }
}

export default async function debug(app) {
  app.use('debug', new DebugService())
}
