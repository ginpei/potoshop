import firebase from '../plugins/firebase';

const db = firebase.firestore().collection('v1-images');
const storageRef = firebase.storage().ref('v1-images');

export interface IImageRecord {
  createdAt: number;
  height: number;
  id: string;
  url: string;
  width: number;
}

export function readBlob (el: HTMLCanvasElement) {
  return  new Promise<Blob>((resolve) => {
    el.toBlob(resolve as any);
  });
}

interface IUploadImageArgs {
  blob: Blob;
  height: number;
  // onStateChange?: (snapshot: firebase.storage.UploadTaskSnapshot) => void;
  uid: string;
  width: number;
}
export async function uploadImage (args: IUploadImageArgs) {
  const { blob, height, uid, width } = args;

  // prepare record
  const imageRef = await db.doc(uid).collection('images').add({
    createdAt: Date.now(),
    height,
    width,
  });

  // store image
  const path = `${uid}/${imageRef.id}.png`;
  const task = storageRef.child(path).put(blob);
  // if (args.onStateChange) {
  //   task.on('state_changed', args.onStateChange);
  // }
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

export function loadImage (data: string | Blob): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = typeof data === 'string' ? data : URL.createObjectURL(data);

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
