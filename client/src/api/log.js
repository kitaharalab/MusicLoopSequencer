import axios from "axios";

import { auth } from "./authentication/firebase";

export async function sendSongPlayLog(projectId, songId) {
  const url = `${
    import.meta.env.VITE_SERVER_URL
  }/projects/${projectId}/songs/${songId}/wav`;
  const idToken = await auth.currentUser?.getIdToken();
  axios.post(
    url,
    { play: true },
    { headers: { Authorization: `Bearer ${idToken}` } },
  );
}

export async function sendSongPauseLog(projectId, songId) {
  const url = `${
    import.meta.env.VITE_SERVER_URL
  }/projects/${projectId}/songs/${songId}/wav`;
  const idToken = await auth.currentUser?.getIdToken();
  axios.post(
    url,
    { pause: true },
    { headers: { Authorization: `Bearer ${idToken}` } },
  );
}

export async function sendSongStopLog(projectId, songId) {
  const url = `${
    import.meta.env.VITE_SERVER_URL
  }/projects/${projectId}/songs/${songId}/wav`;
  const idToken = await auth.currentUser?.getIdToken();
  axios.post(
    url,
    { stop: true },
    { headers: { Authorization: `Bearer ${idToken}` } },
  );
}

export async function sendLoopMuteLog(projectId, songId, isMute) {
  const url = `${
    import.meta.env.VITE_SERVER_URL
  }/projects/${projectId}/songs/${songId}`;

  const idToken = await auth.currentUser?.getIdToken();
  axios.post(
    url,
    { mute: isMute },
    {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    },
  );
}
