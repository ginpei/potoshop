import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import config from './firebase.config.js';

firebase.initializeApp(config);

// https://firebase.google.com/docs/reference/js/firebase.firestore.Settings
firebase.firestore().settings({ timestampsInSnapshots: true });

export default firebase;
