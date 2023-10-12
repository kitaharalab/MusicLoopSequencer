/* eslint-disable import/no-extraneous-dependencies */
import { AddIcon } from "@chakra-ui/icons";
import {
  Box,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  IconButton,
  Text,
} from "@chakra-ui/react";
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
      <Card bgColor="darkslategrey" align="center" width="30vw">
        <CardBody>
          <Box>
            <IconButton
              type="button"
              onClick={() => createNewProject()}
              icon={<AddIcon />}
              width="25%"
              alignSelf="center"
            />
          </Box>
          <Text color="white">create new project</Text>
        </CardBody>
      </Card>
      <SimpleGrid minChildWidth="30vw" spacing={4} marginTop={2}>
        {projects.map((project, i) => (
          <Card key={project} width="30vw">
            <Link to={`App?projectid=${i}`}>
              <CardHeader>{project}</CardHeader>
            </Link>
          </Card>
        ))}
      </SimpleGrid>
    </Box>
  );
}

export default Project;
