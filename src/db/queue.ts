import {Store} from './types'
import {Fire} from './firestore'

export class Queue {
  name: string
  store: Store<any>

  constructor(name: string) {
    this.name = name
    this.store = new Fire(name)
  }

  async run() {}
}
