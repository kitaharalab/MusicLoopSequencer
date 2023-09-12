import { Box } from "@chakra-ui/react";
import React from "react";

import LoopTopicView from "./LoopTopicView";
import TopicPreferenceView from "./TopicPreferenceView";

const sampleTopicPreference = [
  { name: "lowest", value: 20 },
  { name: "lower", value: 20 },
  { name: "higher", value: 30 },
  { name: "highest", value: 40 },
];

const sampleLoopTopic = [
  { name: "lowest", value: 1 },
  { name: "lower", value: 1 },
  { name: "higher", value: 2 },
  { name: "highest", value: 4 },
];

export default function TopicView() {
  const width = 400;
  const height = 400;

  return (
    <Box>
      <Box marginY={4}>
        <LoopTopicView
          data={sampleLoopTopic}
          width={width}
          height={height / 2}
        />
      </Box>
      <Box marginY={4}>
        <TopicPreferenceView
          data={sampleTopicPreference}
          width={width}
          height={height / 2}
        />
      </Box>
    </Box>
  );
}
