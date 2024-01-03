import axios from "axios";

import { auth } from "./firebase";

export default async function checkSignIn(ownId) {
  const url = `${import.meta.env.VITE_SERVER_URL}/user/signin`;
  const idToken = await auth.currentUser?.getIdToken();
  const response = await axios
    .post(
      url,
      { own_id: ownId },
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      },
    )
    .catch((error) => error.response);
  const data = response?.data;

  return data?.status;
}
