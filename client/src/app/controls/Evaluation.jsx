import { StarIcon } from "@chakra-ui/icons";
import { Box, IconButton } from "@chakra-ui/react";
import React, { useState } from "react";

export default function Evaluation() {
  const [evaluation, setEvaluation] = useState(0);
  const EVALUATION_MAX = 5;

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
              onClick={() => {
                setEvaluation(value === evaluation ? 0 : value);
              }}
            />
          );
        })}
    </Box>
  );
}
