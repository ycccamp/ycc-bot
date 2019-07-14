import {Store} from './types'
import {MultiCache} from './multi-cache'

export class Queue {
  name: string
  store: Store<any>

  constructor(name: string) {
    this.name = name
    this.store = new MultiCache({name, strategy: 'hybrid'})
  }

  async run() {}
}
