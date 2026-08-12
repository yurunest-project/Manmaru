import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  browserPopupRedirectResolver,
  getAuth,
  indexedDBLocalPersistence,
  initializeAuth,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

function resolveAuthDomain(configured: string | undefined) {
  if (typeof window === "undefined") return configured;
  const host = window.location.hostname;
  // localhost は Firebase 標準ドメイン。Vercel 本番は同一ドメインで auth をプロキシする
  if (host !== "localhost" && host !== "127.0.0.1") return host;
  return configured;
}

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: resolveAuthDomain(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined),
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
      persistence: indexedDBLocalPersistence,
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  } catch {
    auth = getAuth(app);
  }
  db = getFirestore(app);
}

export { auth, db };
