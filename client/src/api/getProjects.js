import axios from "axios";

import { auth } from "./authentication/firebase";

export default async function getProjects() {
  const url = `${import.meta.env.VITE_SERVER_URL}/projects`;

  const idToken = await auth.currentUser?.getIdToken();
  const response = await axios
    .get(url, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    })
    .catch(() => ({ data: [] }));

  const { data } = response;
  return data;
}
