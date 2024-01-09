import axios from "axios";

export async function sendSongPlayLog(projectId, songId, user) {
  if (!user) {
    return;
  }

  const url = `${
    import.meta.env.VITE_SERVER_URL
  }/projects/${projectId}/songs/${songId}/wav`;
  const idToken = await user.getIdToken();
  axios.post(
    url,
    { play: true },
    { headers: { Authorization: `Bearer ${idToken}` } },
  );
}

export async function sendSongPauseLog(projectId, songId, user) {
  if (!user) {
    return;
  }
  const url = `${
    import.meta.env.VITE_SERVER_URL
  }/projects/${projectId}/songs/${songId}/wav`;
  const idToken = await user.getIdToken();
  axios.post(
    url,
    { pause: true },
    { headers: { Authorization: `Bearer ${idToken}` } },
  );
}

export async function sendSongStopLog(projectId, songId, user) {
  if (!user) {
    return;
  }
  const url = `${
    import.meta.env.VITE_SERVER_URL
  }/projects/${projectId}/songs/${songId}/wav`;
  const idToken = await user.getIdToken();
  axios.post(
    url,
    { stop: true },
    { headers: { Authorization: `Bearer ${idToken}` } },
  );
}

export async function sendLoopMuteLog(projectId, songId, isMute, user) {
  if (!user) {
    return;
  }
  const url = `${
    import.meta.env.VITE_SERVER_URL
  }/projects/${projectId}/songs/${songId}`;

  const idToken = await user.getIdToken();
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

export async function sendCheckSongLoopLog(
  projectId,
  songId,
  part,
  measureId,
  loopId,
  user,
) {
  if (!user) {
    return;
  }
  const url = new URL(
    `/projects/${projectId}/songs/${songId}/parts/${part}/measures/${measureId}/musicloops/${loopId}`,
    import.meta.env.VITE_SERVER_URL,
  );
  const idToken = await user.getIdToken();
  axios.post(
    url,
    { check: true },
    {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    },
  );
}

export async function sendActiveLog(projectId, active, user) {
  if (!user) {
    return;
  }
  const url = new URL(
    `/projects/${projectId}/log/active`,
    import.meta.env.VITE_SERVER_URL,
  );
  const idToken = await user.getIdToken();
  axios.post(
    url,
    { active },
    {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    },
  );
}
