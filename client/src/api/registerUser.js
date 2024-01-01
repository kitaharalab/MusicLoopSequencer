import axios from "axios";

import { auth } from "./authentication/firebase";

export default async function registerUser(ownId) {
    const url = `${import.meta.env.VITE_SERVER_URL}/user`;
    const idToken = await auth.currentUser?.getIdToken();
    const response = await axios.post(url, { own_id: ownId }, {
        headers: {
            Authorization: `Bearer ${idToken}`,
        },
    });
    return response;
}
