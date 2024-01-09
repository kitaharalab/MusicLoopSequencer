import axios from "axios";

export default async function checkSignIn(ownId, user) {
  if (!user) {
    return false;
  }

  const url = `${import.meta.env.VITE_SERVER_URL}/user/signin`;
  const idToken = await user.getIdToken();
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
