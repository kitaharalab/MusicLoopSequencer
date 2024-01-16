import axios from "axios";

export default async function createProject(project = {}, user = null) {
  if (!user) {
    return Promise.reject(new Error("User is not signed in"));
  }

  const url = `${import.meta.env.VITE_SERVER_URL}/projects`;
  const idToken = await user.getIdToken();
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
