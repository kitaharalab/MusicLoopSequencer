import axios from "axios";

export default async function getLoopByChord(partId, musicLoopId) {
  const url = new URL(
    `/parts/${partId}/musicloops/${musicLoopId}`,
    import.meta.env.VITE_SERVER_URL,
  );

  const response = await axios.get(url);
  const { data } = response;
  if (!data[1]) {
    data[1] = musicLoopId;
  }

  return data;
}
