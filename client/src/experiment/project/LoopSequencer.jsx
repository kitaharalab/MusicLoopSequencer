import React, { Suspense, useState } from "react";
import { useParams } from "react-router-dom";

import Content from "./components/Content";
import Header from "./components/Header";

export default function LoopSequencer() {
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState();

  async function getProjectName() {
    const url = `${import.meta.env.VITE_SERVER_URL}/projects/${projectId}`;
    const response = await fetch(url);
    const data = await response.json();
    const {
      project: { name },
    } = data;
    setProjectName(name);
  }

  getProjectName();

  return (
    <>
      <Header projectName={projectName} />
      <Content projectId={projectId} />
    </>
  );
}
