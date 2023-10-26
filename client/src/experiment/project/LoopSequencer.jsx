import React from "react";
import { useParams } from "react-router-dom";

import Content from "./components/Content";
import Header from "./components/Header";

export default function LoopSequencer() {
  const { projectId } = useParams();
  return (
    <>
      <Header projectName={projectId} />
      <Content projectId={projectId} />
    </>
  );
}
