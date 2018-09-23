import firebase from '../plugins/firebase';

const db = firebase.firestore().collection('v1-images');
const storageRef = firebase.storage().ref('v1-images');

export interface IImageRecord {
  createdAt: number;
  id: string;
  url: string;
}

export function readBlob (el: HTMLCanvasElement) {
  return  new Promise<Blob>((resolve) => {
    el.toBlob(resolve as any);
  });
}

interface IUploadImageArgs {
  blob: Blob;
  uid: string;
  onStateChange?: (snapshot: firebase.storage.UploadTaskSnapshot) => void;
}
export async function uploadImage (args: IUploadImageArgs) {
  const { blob, uid } = args;

  // prepare record
  const imageRef = await db.doc(uid).collection('images').add({
    createdAt: Date.now(),
  });

  // store image
  const path = `${uid}/${imageRef.id}.png`;
  const task = storageRef.child(path).put(blob);
  if (args.onStateChange) {
    task.on('state_changed', args.onStateChange);
  }
  const uploadedRef = (await task).ref;

  // remember image url
  imageRef.set({
    url: await uploadedRef.getDownloadURL(),
  }, { merge: true });

  return uploadedRef;
}

export async function fetchList (uid: string): Promise<IImageRecord[]> {
  const ref = db.doc(uid).collection('images');
  const images = await ref
    .orderBy('createdAt', 'desc')
    .get();
  const list = images.docs.map((v) => {
    const data = v.data() as IImageRecord;
    data.id = v.id;
    return data;
  });
  return list;
}
