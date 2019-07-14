import admin from 'firebase-admin'

import {firestore} from './firebase'
import {Store, BaseRecord} from './types'
import {deleteCollection} from './firestore-delete'

type CollectionReference = admin.firestore.CollectionReference

export class Fire<T extends BaseRecord> implements Store<any> {
  collection: CollectionReference

  constructor(name: string) {
    this.collection = firestore.collection(name)
  }

  set(id: string, data: T) {
    const docRef = this.collection.doc(id)

    return docRef.set(data)
  }

  setAll(data: T[]) {
    const batch = firestore.batch()

    data.forEach(item => {
      const docRef = this.collection.doc(item.id)

      batch.set(docRef, item)
    })

    return batch.commit()
  }

  create(data: T) {
    return this.collection.add(data)
  }

  async get(id: string) {
    const docRef = this.collection.doc(id)

    const doc = await docRef.get()
    if (!doc.exists) return null

    return doc.data()
  }

  async list() {
    const snap = await this.collection.get()

    return snap.docs
      .map(doc => {
        if (!doc.exists) return null

        return {id: doc.id, ...doc.data()}
      })
      .filter(x => x)
  }

  async update(id: string, data: T) {
    const docRef = this.collection.doc(id)

    return docRef.update(data)
  }

  async delete(id: string) {
    const docRef = this.collection.doc(id)

    return docRef.delete()
  }

  async clear(): Promise<void> {
    await deleteCollection(this.collection, 50)
  }
}
