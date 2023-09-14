/* eslint-disable import/no-extraneous-dependencies */
import { ListItem, UnorderedList, Button, Box } from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";

import Link from "../components/Link/Link";
import "./Project.css";

function Project() {
  const [done, setDone] = useState(false);
  const [sample, _setSample] = useState(null);
  const [projects, setProjects] = useState([]);

  const createNewProject = () => {
    const url = `${import.meta.env.VITE_SERVER_URL}/projects`;
    axios
      .post(url) // サーバーから音素材の配列を受け取った後，then部分を実行する．
      .then((response) => {
        const { projectid } = response.data;
        setProjects([...projects, projectid]);
      });
    console.log("OK");
  };

  useEffect(() => {
    let ignore = false;
    function makeLink() {
      if (done) {
        return;
      }

      axios
        .get(`${import.meta.env.VITE_SERVER_URL}/projects`)
        .then((response) => {
          const resProjects = response.data.projects_list;
          setProjects(resProjects);
          setDone(true);
        });
    }
    if (!ignore) {
      makeLink();
    }
    return () => {
      ignore = true;
    };
  }, [sample]);

  return (
    <Box id="project">
      <Button type="button" onClick={() => createNewProject()}>
        createNewProject
      </Button>
      <UnorderedList>
        {projects.map((project, i) => (
          <ListItem key={project}>
            <Link to={`App?projectid=${i}`}>{project}</Link>
          </ListItem>
        ))}
      </UnorderedList>
    </Box>
  );
}

export default Project;
