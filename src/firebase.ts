import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import defaultAppletConfig from '../firebase-applet-config.json';
import type { OperationType, FirestoreErrorInfo, Technique } from './types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || defaultAppletConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaultAppletConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultAppletConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || defaultAppletConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultAppletConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || defaultAppletConfig.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || defaultAppletConfig.measurementId || undefined,
};

const isCustomFirebase = !!(
  import.meta.env.VITE_FIREBASE_PROJECT_ID ||
  import.meta.env.VITE_FIREBASE_API_KEY ||
  import.meta.env.VITE_FIREBASE_APP_ID
);

const firestoreDatabaseId = isCustomFirebase
  ? (import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || undefined)
  : (defaultAppletConfig.firestoreDatabaseId || undefined);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
}, firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Erro de login Google: ', error);
    throw error;
  }
}

export async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Erro de logout: ', error);
    throw error;
  }
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error Payload: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const TECHNIQUES_COLLECTION = 'techniques';

export async function saveTechnique(
  technique: Omit<Technique, 'userId' | 'createdAt' | 'updatedAt'>,
  isEdit: boolean
): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Usuário não autenticado.');

  const docPath = `${TECHNIQUES_COLLECTION}/${technique.id}`;

  try {
    if (isEdit) {
      const docRef = doc(db, TECHNIQUES_COLLECTION, technique.id);
      await setDoc(
        docRef,
        {
          name: technique.name,
          group: technique.group,
          description: technique.description || '',
          progress: Number(technique.progress),
          videoUrl: technique.videoUrl || '',
          testedInSparring: Boolean(technique.testedInSparring),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } else {
      const docRef = doc(db, TECHNIQUES_COLLECTION, technique.id);
      await setDoc(docRef, {
        id: technique.id,
        userId: currentUser.uid,
        name: technique.name,
        group: technique.group,
        description: technique.description || '',
        progress: Number(technique.progress),
        videoUrl: technique.videoUrl || '',
        testedInSparring: Boolean(technique.testedInSparring),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(
      error,
      isEdit ? 'update' : 'create',
      docPath
    );
  }
}

export async function deleteTechnique(techniqueId: string): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Usuário não autenticado.');

  const docPath = `${TECHNIQUES_COLLECTION}/${techniqueId}`;
  try {
    const docRef = doc(db, TECHNIQUES_COLLECTION, techniqueId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, 'delete', docPath);
  }
}

export function subscribeToTechniques(
  userId: string,
  onData: (techniques: Technique[]) => void,
  onError: (error: Error) => void
) {
  const pathForList = TECHNIQUES_COLLECTION;
  const q = query(
    collection(db, TECHNIQUES_COLLECTION),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Technique[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        const createdAt = data.createdAt?.toDate
          ? data.createdAt.toDate().toISOString()
          : data.createdAt || new Date().toISOString();

        const updatedAt = data.updatedAt?.toDate
          ? data.updatedAt.toDate().toISOString()
          : data.updatedAt || new Date().toISOString();

        list.push({
          ...(data as Omit<Technique, 'createdAt' | 'updatedAt'>),
          createdAt,
          updatedAt,
        } as Technique);
      });

      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      onData(list);
    },
    (originalError) => {
      try {
        handleFirestoreError(
          originalError,
          'list',
          pathForList
        );
      } catch (mappedError: any) {
        onError(mappedError);
      }
    }
  );
}
