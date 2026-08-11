import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './firebaseConfig';
import appletConfig from '../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app, appletConfig.firestoreDatabaseId || '(default)');
export const storage = getStorage(app, firebaseConfig.storageBucket || appletConfig.storageBucket);
export const auth = getAuth(app);

export default app;
