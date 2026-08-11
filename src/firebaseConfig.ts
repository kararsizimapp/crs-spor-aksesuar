import appletConfig from '../firebase-applet-config.json';

const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};

export const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || appletConfig.apiKey || 'AIzaSyAjsBuav1F_oOIoSp-MqULtWBM54hIw2VM',
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain || 'crs-aksesuar.firebaseapp.com',
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || appletConfig.projectId || 'crs-aksesuar',
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || appletConfig.storageBucket || 'crs-aksesuar.firebasestorage.app',
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig.messagingSenderId || '689565134975',
  appId: metaEnv.VITE_FIREBASE_APP_ID || appletConfig.appId || '1:689565134975:web:93b804c4b57cc6e9db8f4a',
  measurementId: metaEnv.VITE_FIREBASE_MEASUREMENT_ID || appletConfig.measurementId || 'G-YB0KFGJ0ER',
};

export default firebaseConfig;


