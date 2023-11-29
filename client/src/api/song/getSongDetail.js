import axios from "axios";

export default async function getSongDetail(projectId, songId) {
  if (projectId == null || songId == null) {
    return null;
  }

  const url = `${
    import.meta.env.VITE_SERVER_URL
  }/projects/${projectId}/songs/${songId}`;
  const { data } = await axios.get(url).catch(() => ({}));
  const parts = data?.parts;

  return parts;
}
