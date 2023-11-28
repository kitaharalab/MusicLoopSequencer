import axios from "axios";

import { auth } from "@/components/authentication/firebase";

export default async function deleteLoop(projectId, songId, measure, part) {
  if (measure == null || part == null) {
    return Promise.reject(new RangeError("No measure or part selected"));
  }
  if (projectId == null || songId == null) {
    return Promise.reject(new RangeError("No project or song selected"));
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

  const idToken = await auth.currentUser?.getIdToken();
  return axios.delete(url, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
}
