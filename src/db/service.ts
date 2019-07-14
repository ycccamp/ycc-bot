import {Table} from './database'

interface ServiceOption {}

export class AirtableService {
  table: Table
  options: ServiceOption

  constructor(Table: Table, options: ServiceOption = {}) {
    this.table = Table
    this.options = options
  }

  async find() {
    return this.table.find()
  }

  async get(id: string) {
    return this.table.get(id)
  }

  async create(data: any) {
    return this.table.create(data)
  }

  async update(id: string, data: any) {
    return this.table.update(id, data)
  }

  async patch(id: string, data: any) {
    return this.table.update(id, data)
  }
}

export const Service = AirtableService

export default function(Table: Table, options: ServiceOption) {
  return new Service(Table, options)
}
