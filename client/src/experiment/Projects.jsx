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
import { useNavigate } from "react-router-dom";

import Link from "../../components/Link/Link";

export default function Projects() {
  const [sample, _setSample] = useState(null);
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

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
    axios
      .get(`${import.meta.env.VITE_SERVER_URL}/projects`)
      .then((response) => {
        const { data } = response;
        setProjects(data);
      });
  }, [sample]);

  return (
    <Box id="project">
      <Card bgColor="darkslategrey" align="center" width="30vw">
        <CardBody>
          <Box>
            <IconButton
              type="button"
              onClick={() => {
                createNewProject();
                const createdProject = projects[projects.length - 1];
                navigate(`${createdProject.id}`);
              }}
              icon={<AddIcon />}
              width="25%"
              alignSelf="center"
            />
          </Box>
          <Text color="white">create new project</Text>
        </CardBody>
      </Card>
      <SimpleGrid minChildWidth="30vw" spacing={4} marginTop={2}>
        {projects?.map(({ id, name }) => (
          <Card key={id} width="30vw">
            {/* TODO: idに対応したプロジェクトの値 */}
            <Link to={`App?projectid=${id}`}>
              <CardHeader>{name}</CardHeader>
            </Link>
          </Card>
        ))}
        <Card width="30vw">
          <Link to="experiment">
            <CardHeader>experiment</CardHeader>
          </Link>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
