import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

import { setLine, setMax } from "../../redux/linesSlice";

import Content from "./components/Content";
import Header from "./components/Header";

export default function LoopSequencer() {
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState();
  const dispatch = useDispatch();

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

  dispatch(setLine({ lines: [] }));
  dispatch(setMax(0));

  return (
    <>
      <Header projectName={projectName} />
      <Content projectId={projectId} />
    </>
  );
}
