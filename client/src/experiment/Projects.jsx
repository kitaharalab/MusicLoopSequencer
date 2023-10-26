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

  useEffect(() => {
    const baseURL = new URL(`${import.meta.env.VITE_SERVER_URL}/projects`);
    const url = new URL(`?experiment=true`, baseURL);
    axios.get(url).then((response) => {
      const { data } = response;
      setProjects(data);
    });
  }, [sample]);

  return (
    <Box id="project">
      <Card bgColor="darkslategrey" align="center" width="30vw">
        <CardBody>
          <Text color="white">Projects</Text>
        </CardBody>
      </Card>
      <SimpleGrid minChildWidth="30vw" spacing={4} marginTop={2}>
        {projects?.map(({ id, name }) => (
          <Card key={id} width="30vw">
            <Link to={`${id}`}>
              <CardHeader>
                {id}:{name}
              </CardHeader>
            </Link>
          </Card>
        ))}
      </SimpleGrid>
    </Box>
  );
}
