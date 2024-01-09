import axios from "axios";

export default async function getProjects(user) {
  if (!user) {
    return [];
  }
  const url = `${import.meta.env.VITE_SERVER_URL}/projects`;

  const idToken = await user.getIdToken();
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
