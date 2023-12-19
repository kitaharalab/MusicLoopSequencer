import axios from "axios";

export default async function getParts() {
  const url = `${import.meta.env.VITE_SERVER_URL}/parts`;
  const response = await axios.get(url).catch(() => ({}));
  const { data } = response;
  return data;
}
