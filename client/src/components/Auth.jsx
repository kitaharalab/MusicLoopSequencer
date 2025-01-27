import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup as firebaseSignIn,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";

import { auth } from "@/api/authentication/firebase";

const UserContext = createContext();

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(auth.currentUser);
  useEffect(
    () =>
      onAuthStateChanged(auth, (authUser) => {
        setUser(authUser);
      }),
    [],
  );
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export async function signIn() {
  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: "select_account",
  });

  const result = await firebaseSignIn(auth, googleProvider).catch(
    (error) => error,
  );
  console.log(result);
}

export function signOut() {
  firebaseSignOut(auth);
}
