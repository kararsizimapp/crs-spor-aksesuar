import appletConfig from '../firebase-applet-config.json';

const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};

export const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || appletConfig.apiKey || '',
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain || 'crs-aksesuar.firebaseapp.com',
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || appletConfig.projectId || 'crs-aksesuar',
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || appletConfig.storageBucket || 'crs-aksesuar.firebasestorage.app',
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig.messagingSenderId || '',
  appId: metaEnv.VITE_FIREBASE_APP_ID || appletConfig.appId || '',
};

export default firebaseConfig;


