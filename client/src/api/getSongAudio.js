import axios from "axios";

export default async function getSongAudio(projectId, songId) {
  if (songId === undefined || songId === null) {
    return null;
  }

  const url = `${
    import.meta.env.VITE_SERVER_URL
  }/projects/${projectId}/songs/${songId}/wav/`;

  const response = await axios
    .get(url, {
      responseType: "blob",
      headers: { "Content-Type": "audio/wav" },
    })
    .catch((error) => {
      console.log(error);
      return error.response;
    });

  if (!response || response.status !== 200) {
    return null;
  }

  const { data } = response;
  const songUrl = window.URL.createObjectURL(
    new Blob([data], { type: "audio/wav" }),
  );

  const songAudio = new Audio(songUrl);
  return { url: songUrl, audio: songAudio };
}
