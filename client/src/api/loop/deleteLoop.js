import axios from "axios";

export default async function deleteLoop(
  projectId,
  songId,
  measure,
  part,
  user,
) {
  if (measure == null || part == null) {
    return Promise.reject(new RangeError("No measure or part selected"));
  }
  if (projectId == null || songId == null) {
    return Promise.reject(new RangeError("No project or song selected"));
  }

  if (!user) {
    return Promise.reject(new Error("User is not signed in"));
  }

  const deleteUrl = `${
    import.meta.env.VITE_SERVER_URL
  }/projects/${projectId}/songs/${songId}/parts/${part}/measures/${measure}`;
  const url = new URL(deleteUrl);
  url.searchParams.append("fix", import.meta.env.VITE_MODE_FIX ?? 1);
  url.searchParams.append(
    "structure",
    import.meta.env.VITE_MODE_STRUCTURE ?? 0,
  );
  url.searchParams.append("adapt", import.meta.env.VITE_MODE_ADAPT ?? 0);

  const idToken = await user.getIdToken();
  return axios.delete(url, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
}
