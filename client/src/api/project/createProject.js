import axios from "axios";

import { auth } from "../authentication/firebase";

export default async function createProject(project = {}) {
  const url = `${import.meta.env.VITE_SERVER_URL}/projects`;
  const idToken = await auth.currentUser?.getIdToken();
  const response = await axios
    .post(url, project, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    })
    .catch(() => ({ data: [] }));
  const { data: newProjectId } = response;
  return newProjectId;
}
