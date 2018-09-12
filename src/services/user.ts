import firebase from '../plugins/firebase';

const db = firebase.firestore();

export async function saveLogin (uid: string) {
  const ref = db.collection('v1-users').doc(uid);

  const snapshot = await ref.get();
  if (!snapshot.exists) {
    await ref.set({
      createdAt: Date.now(),
    }, { merge: true });
  }

  return ref.set({
    lastLogin: Date.now(),
  }, { merge: true });
}
