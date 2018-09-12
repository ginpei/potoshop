export function readBlob (el: HTMLCanvasElement) {
  return  new Promise<Blob>((resolve) => {
    el.toBlob(resolve as any);
  });
}

interface IUploadImageArgs {
  blob: Blob;
  storageRef: firebase.storage.Reference;
  uid: string;
  onStateChange?: (snapshot: firebase.storage.UploadTaskSnapshot) => void;
}
export async function uploadImage (args: IUploadImageArgs) {
  const { blob, uid, storageRef } = args;

  const key = Date.now() + (Math.random() * 1000).toString().padStart(4, '0');
  const path = `${uid}/${key}.png`;
  const ref = storageRef.child(path);
  const task = ref.put(blob);

  if (args.onStateChange) {
    task.on('state_changed', args.onStateChange);
  }

  return (await task).ref;
}
