import admin from 'firebase-admin'

import {firestore} from './firebase'

type Query = admin.firestore.Query
type CollectionReference = admin.firestore.CollectionReference

export function deleteCollection(ref: CollectionReference, batchSize: number) {
  const query = ref.orderBy('__name__').limit(batchSize)

  return deleteQueryBatch(query, batchSize)
}

async function deleteQueryBatch(query: Query, batchSize: number) {
  const snapshot = await query.get()
  if (snapshot.size == 0) return 0

  const batch = firestore.batch()
  snapshot.docs.forEach(doc => batch.delete(doc.ref))

  await batch.commit()

  const numDeleted = snapshot.size
  if (numDeleted === 0) return

  return process.nextTick(() => deleteQueryBatch(query, batchSize))
}
