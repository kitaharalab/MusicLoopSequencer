import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_DEV_API_KEY,
  authDomain: import.meta.env.VITE_DEV_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_DEV_PROJECT_ID,
  storageBucket: import.meta.env.VITE_DEV_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_DEV_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_DEV_APP_ID,
  measurementId: import.meta.env.VITE_DEV_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, app };
