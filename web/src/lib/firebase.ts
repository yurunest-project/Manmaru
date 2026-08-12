import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  browserSessionPersistence,
  getAuth,
  indexedDBLocalPersistence,
  initializeAuth,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { isIOS } from "./authFlow";

const configuredAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;
const firebaseDefaultDomain = projectId ? `${projectId}.firebaseapp.com` : configuredAuthDomain;

function resolveAuthDomain() {
  if (typeof window === "undefined") return configuredAuthDomain;
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return configuredAuthDomain;
  // iPhone: 必ず Firebase 標準ドメイン（Google に登録済みの redirect URI）
  if (isIOS()) return firebaseDefaultDomain;
  // PC: 同一ドメイン auth
  return host;
}

export const firebaseAuthDomain = resolveAuthDomain();

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: firebaseAuthDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

export const firebaseReady = Boolean(
  config.apiKey &&
    config.authDomain &&
    config.projectId &&
    config.appId &&
    !config.apiKey.includes("REPLACE") &&
    config.apiKey.length > 10,
);

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

if (firebaseReady) {
  app = getApps().length ? getApps()[0] : initializeApp(config);
  try {
    auth = initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence],
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  } catch {
    auth = getAuth(app);
  }
  db = getFirestore(app);
}

export { auth, db, configuredAuthDomain };
