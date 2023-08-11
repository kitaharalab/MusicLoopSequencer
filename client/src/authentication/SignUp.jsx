/* eslint-disable import/no-extraneous-dependencies */
import React, { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import auth from "./firebase";

export default function SignUp() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
    });
  }, []);

  return (
    <div>
      <p>sign up</p>
      <p>現在のユーザーのemail：{user?.email ?? "none"}</p>
      <p>ユーザー登録</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const { email, password } = e.target.elements;
          try {
            await createUserWithEmailAndPassword(
              auth,
              email.value,
              password.value,
            );
          } catch (error) {
            console.log(error);
          }
        }}
      >
        <div>
          <label htmlFor="signup-email">
            mail
            <input
              id="signup-email"
              name="email"
              type="email"
              placeholder="email"
              autoComplete="username"
              disabled={user}
            />
          </label>
        </div>
        <div>
          <label htmlFor="signup-email">
            password
            <input
              id="signup-email"
              name="password"
              type="password"
              placeholder="password"
              autoComplete="new-password"
              disabled={user}
            />
          </label>
        </div>
        <div>
          <button type="submit" disabled={user}>
            send
          </button>
        </div>
      </form>
    </div>
  );
}
