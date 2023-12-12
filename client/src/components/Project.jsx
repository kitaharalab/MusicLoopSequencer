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
  Button,
  Spinner,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import Link from "./Link/Link";

import { createProject, getProjects } from "@/api/project";
import { setProjectId, setSongId } from "@/redux/apiParamSlice";
import { signIn, useUser } from "./Auth";

function Project() {
  const user = useUser();
  const [projects, setProjects] = useState(null);
  const dispatch = useDispatch();

  async function createNewProject() {
    const newProjectId = await createProject();
    setProjects([...projects, newProjectId]);
  }

  async function updateProjects() {
    const data = await getProjects();
    setProjects(data);
  }

  useEffect(() => {
    dispatch(setProjectId(undefined));
    dispatch(setSongId(undefined));
  }, []);

  useEffect(() => {
    updateProjects();
  }, [user]);

  return (
    <Box id="project">
      <Flex>
        <Card bgColor="darkslategrey" align="center" width="30vw">
          <CardBody>
            <Box>
              <IconButton
                type="button"
                onClick={() => {
                  createNewProject();
                }}
                isDisabled={user == null}
                icon={<AddIcon />}
                width="25%"
                alignSelf="center"
              />
            </Box>
            <Text color="white">プロジェクトを作る</Text>
          </CardBody>
        </Card>
      </Flex>

      {projects === null ? (
        <Spinner />
      ) : (
        <SimpleGrid minChildWidth="30vw" spacing={4} marginTop={2}>
          {projects.length === 0 ? (
            <Card>
              <CardHeader>プロジェクトをまだ作っていないようです👀</CardHeader>
              <CardBody>
                <Box>
                  <Text>サインインしてプロジェクトを作成してみましょう</Text>
                </Box>
                {!user && (
                  <Button
                    variant="link"
                    onClick={() => {
                      signIn();
                    }}
                  >
                    サインインはこちら
                  </Button>
                )}
              </CardBody>
            </Card>
          ) : (
            projects?.map(({ id, name }) => (
              <Card key={id} width="30vw">
                <Link to={`App?projectid=${id}`}>
                  <CardHeader>{name}</CardHeader>
                </Link>
              </Card>
            ))
          )}
        </SimpleGrid>
      )}
    </Box>
  );
}

export default Project;
