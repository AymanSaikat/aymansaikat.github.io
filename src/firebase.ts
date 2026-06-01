import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  getDoc,
  serverTimestamp,
  getDocFromServer
} from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

// Types matching firestore-blueprint
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth ? auth.currentUser?.uid : null,
      email: auth ? auth.currentUser?.email : null,
      emailVerified: auth ? auth.currentUser?.emailVerified : null,
      isAnonymous: auth ? auth.currentUser?.isAnonymous : null,
      tenantId: auth ? auth.currentUser?.tenantId : null,
      providerInfo: auth ? auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [] : []
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const isFirebaseConfigured = () => {
  return firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== "PLACEHOLDER";
};

// Initialize Firebase
let app;
let db: any = null;
let auth: any = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (err) {
    console.warn("Failed to initialize Firebase with current credentials:", err);
  }
}

export { db, auth, googleProvider };

// Test connection strictly as requested by 'Validate Connection to Firestore' directive
export async function testConnection() {
  if (!db) return;
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("client is offline")) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

if (db) {
  testConnection();
}
