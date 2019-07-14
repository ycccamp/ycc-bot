import {Table} from './db'

interface ServiceOption {}

export class AirtableService {
  Table: Table
  options: ServiceOption

  constructor(Table: Table, options: ServiceOption = {}) {
    this.Table = Table
    this.options = options
  }

  async find() {
    return this.Table.find()
  }

  async get(id: string) {
    return this.Table.get(id)
  }
}

export const Service = AirtableService

export default function(Table: Table, options: ServiceOption) {
  return new Service(Table, options)
}
