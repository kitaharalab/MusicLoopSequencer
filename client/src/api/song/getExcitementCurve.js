import axios from "axios";

import { auth } from "../authentication/firebase";

export default async function getExcitementCurve(projectId, songId) {
  // "/projects/<int:projectid>/songs/<int:songid>"
  if (projectId == null) {
    return Promise.reject(new Error("projectId or songId is null"));
  }

  if (songId == null) {
    const url = new URL(
      `${import.meta.env.VITE_SERVER_URL}/projects/${projectId}/songs/preset`,
    );
    const idToken = await auth.currentUser?.getIdToken();
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    const { data } = response;
    return data;
  }

  const url = new URL(
    `${import.meta.env.VITE_SERVER_URL}/projects/${projectId}/songs/${songId}`,
  );

  const idToken = await auth.currentUser?.getIdToken();
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
  const { data } = response;
  const {
    excitement_curve: { curve, max_value: max },
  } = data;

  return { curve, max };
}
