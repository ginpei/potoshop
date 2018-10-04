import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

if (process.env.NODE_ENV !== 'test') {
  // tslint:disable-next-line:no-var-requires
  const config = require('./firebase.config.js');
  firebase.initializeApp(config.default);

  // https://firebase.google.com/docs/reference/js/firebase.firestore.Settings
  firebase.firestore().settings({ timestampsInSnapshots: true });
}

export default firebase;
