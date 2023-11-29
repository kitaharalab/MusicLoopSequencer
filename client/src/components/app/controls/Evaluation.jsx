import { StarIcon } from "@chakra-ui/icons";
import { Box, IconButton } from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";

import { auth } from "@/api/authentication/firebase";

export default function Evaluation({ projectId, songId }) {
  const [evaluation, setEvaluation] = useState(0);
  const EVALUATION_MAX = 5;

  useEffect(() => {
    async function getEvaluation() {
      if (songId === undefined || songId === null) {
        return;
      }
      const idToken = await auth.currentUser?.getIdToken();
      const url = `${
        import.meta.env.VITE_SERVER_URL
      }/projects/${projectId}/songs/${songId}`;
      const { data } = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      const { evaluation: currentEvaluation } = data;
      setEvaluation(currentEvaluation);
    }

    getEvaluation();
  }, []);

  return (
    <Box>
      {Array(EVALUATION_MAX)
        .fill(false)
        .map((push, i) => {
          const value = i + 1;
          return (
            <IconButton
              key={value}
              size="md"
              background="none"
              icon={
                <StarIcon
                  boxSize="90%"
                  fillOpacity={value <= evaluation ? "100%" : "0%"}
                  color={value <= evaluation ? "gold" : "none"}
                  stroke="gray.500"
                />
              }
              onClick={async () => {
                const newEvaluation = value === evaluation ? 0 : value;
                setEvaluation(newEvaluation);

                if (songId === undefined || songId === null) {
                  return;
                }

                const idToken = await auth.currentUser?.getIdToken();
                const url = `${
                  import.meta.env.VITE_SERVER_URL
                }/projects/${projectId}/songs/${songId}`;
                axios.post(
                  url,
                  { evaluation: newEvaluation },
                  {
                    headers: {
                      Authorization: `Bearer ${idToken}`,
                    },
                  },
                );
              }}
            />
          );
        })}
    </Box>
  );
}
