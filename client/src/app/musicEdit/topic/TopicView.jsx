/* eslint-disable import/no-unresolved */
import { Box, Card, CardBody, Text } from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";

import LoopTopicView from "./LoopTopicView";
import TopicLegend from "./TopicLegend";
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

export default function TopicView({ projectId }) {
  const wrapperRef = useRef();
  const [width, setWidth] = useState(400);
  const [topicPreferenceData, setTopicPreferenceData] = useState();
  const contentHeight = 200;
  const legendHeight = 100;
  const margin = 25;
  const barPadding = 0.2;

  useEffect(() => {
    setWidth(wrapperRef?.current?.clientWidth);

    const getTopicPreferenceData = async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/topic`,
      );
      const { data } = response;
      console.log(data, data["ratio-topic"]);
    };

    getTopicPreferenceData();
  }, []);

  return (
    <Card marginY={4}>
      <CardBody>
        <Text>Topic Rate</Text>
        <Box ref={wrapperRef}>
          <svg
            width={width}
            height={contentHeight * 2 + legendHeight + margin * 4}
          >
            <g className="content" transform={`translate(0 ${margin})`}>
              <g className="wrapper">
                <LoopTopicView
                  data={sampleLoopTopic}
                  width={width}
                  height={contentHeight}
                  padding={barPadding}
                />
              </g>
              <g
                className="wrapper"
                transform={`translate(0 ${margin + contentHeight})`}
              >
                <TopicPreferenceView
                  data={sampleTopicPreference}
                  width={width}
                  height={contentHeight}
                  padding={barPadding}
                />
              </g>
            </g>
            <g
              className="legend-wrapper"
              transform={`translate(0 ${margin * 3 + contentHeight * 2})`}
            >
              <TopicLegend
                names={sampleLoopTopic.map(({ name }) => name)}
                width={width}
                padding={barPadding}
              />
            </g>
          </svg>
        </Box>
      </CardBody>
    </Card>
  );
}
