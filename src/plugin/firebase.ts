import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/storage';
import config from './firebase.config.js';

firebase.initializeApp(config);

export default firebase;
