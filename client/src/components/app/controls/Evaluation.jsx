import { StarIcon } from "@chakra-ui/icons";
import { Box, IconButton } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { getEvaluation, sendEvaluation } from "@/api/evaluation";
import { useUser } from "@/components/Auth";
import { getApiParams } from "@/redux/apiParamSlice";

export default function Evaluation() {
  const { projectId, songId } = useSelector(getApiParams);
  const [evaluation, setEvaluation] = useState(0);
  const EVALUATION_MAX = 5;
  const user = useUser();

  useEffect(() => {
    async function setEvaluationValue() {
      const currentEvaluation = getEvaluation(projectId, songId, user);
      setEvaluation(currentEvaluation);
    }

    setEvaluationValue();
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
                sendEvaluation(projectId, songId, newEvaluation, user);
              }}
              _active={{
                transform: "scale(0.8)",
              }}
              transition="all 0.1s ease-in-out"
            />
          );
        })}
    </Box>
  );
}
