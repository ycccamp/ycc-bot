import admin from 'firebase-admin'

import {firestore} from './firebase'

type CollectionReference = admin.firestore.CollectionReference

export class Fire {
  collection: CollectionReference

  constructor(name: string) {
    this.collection = firestore.collection(name)
  }

  set(id: string, data: any) {
    const docRef = this.collection.doc(id)

    return docRef.set(data)
  }

  setAll(data: any[]) {
    const batch = firestore.batch()

    data.forEach(item => {
      const docRef = this.collection.doc(item.id)

      batch.set(docRef, item)
    })

    return batch.commit()
  }

  create(data: any) {
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

  async update(id: string, data: any) {
    const docRef = this.collection.doc(id)

    return docRef.update(data)
  }
}
