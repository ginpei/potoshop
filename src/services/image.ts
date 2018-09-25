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

export function loadImage (url: string): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    if (url.startsWith('https://') || url.startsWith('http://')) {
      image.crossOrigin = 'Anonymous';
    }
    image.onload = () => setTimeout(() => resolve(image), 1);
    image.onerror = reject;
    image.src = url;
  });
}

export function getImageUrl (uid: string, imageId: string): Promise<string> {
  return new Promise<string>(async (resolve, reject) => {
    const ref = db.doc(uid).collection('images').doc(imageId);
    const record = (await ref.get()).data();
    if (record) {
      resolve(record.url);
    } else {
      reject(new Error('Failed to get record data, although succeeded to fetch'));
    }
  });
}
