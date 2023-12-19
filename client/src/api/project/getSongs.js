import axios from "axios";

export default async function getSongs(projectId) {
  const url = `${import.meta.env.VITE_SERVER_URL}/projects/${projectId}/songs`;
  const response = await axios.get(url).catch(() => ({ data: [] }));
  const { data } = response;
  return data.map(({ id }) => ({ name: id, id }));
}
