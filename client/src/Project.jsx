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
  Flex,
  Spacer,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";

import Link from "../components/Link/Link";

import "./Project.css";
import SignUp from "./authentication/SignUp";

function Project() {
  const [done, setDone] = useState(false);
  const [sample, _setSample] = useState(null);
  const [projects, setProjects] = useState([]);

  const createNewProject = () => {
    const url = `${import.meta.env.VITE_SERVER_URL}/projects`;
    axios
      .post(url) // サーバーから音素材の配列を受け取った後，then部分を実行する．
      .then((response) => {
        const { data } = response;
        setProjects([...projects, data]);
      });
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
          const { data } = response;
          setProjects(data);
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
      <SignUp />
      <Flex>
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
        <Spacer />
        <Card bgColor="darkslategrey" align="center" width="30vw">
          <Link to="/experiment">
            <CardBody>
              <CardHeader>
                <Text color="white">experiment</Text>
              </CardHeader>
            </CardBody>
          </Link>
        </Card>
      </Flex>

      <SimpleGrid minChildWidth="30vw" spacing={4} marginTop={2}>
        {projects?.map(({ id, name }) => (
          <Card key={id} width="30vw">
            {/* TODO: idに対応したプロジェクトの値 */}
            <Link to={`App?projectid=${id}`}>
              <CardHeader>{name}</CardHeader>
            </Link>
          </Card>
        ))}
      </SimpleGrid>
    </Box>
  );
}

export default Project;
