import { createContext, useContext, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup as firebaseSignIn,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "@/api/authentication/firebase";

const UserContext = createContext();

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(auth.currentUser);
  useEffect(() => {
    return onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
    });
  }, []);
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function signIn() {
  firebaseSignIn(auth, new GoogleAuthProvider())
    .then((result) => {
      console.log(result);
    })
    .catch((error) => {
      console.log(error);
    });
}

export function signOut() {
  firebaseSignOut(auth);
}
