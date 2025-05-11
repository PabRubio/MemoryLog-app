import { initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDxRK7bYRTolyWfCECyjy0dK_A2_o9xeLU",
  authDomain: "memorylog-713.firebaseapp.com",
  projectId: "memorylog-713",
  storageBucket: "memorylog-713.firebasestorage.app",
  messagingSenderId: "252776008221",
  appId: "1:252776008221:web:bf0432861547d1de4294f4"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { app, auth };