import {
  Box,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Text,
  Button,
  Spinner,
  Input,
  Heading,
  Flex,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";

import { useUser } from "./Auth";
import Link from "./Link/Link";

import { createProject, getProjects } from "@/api/project";
import { setProjectId, setSongId } from "@/redux/apiParamSlice";

function NewProject({ onSubmit }) {
  const user = useUser();
  const [loading, setLoading] = useState(false);
  const titleRef = useRef();

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        if (loading) {
          return;
        }
        try {
          setLoading(true);
          const title = titleRef.current.value || null;
          titleRef.current.value = "";
          await onSubmit({ title });
        } finally {
          setLoading(false);
        }
      }}
    >
      <Flex>
        <Input ref={titleRef} placeholder="プロジェクト名" size="lg" />
        <Button
          type="submit"
          isDisabled={user == null}
          ml="4"
          size="lg"
          colorScheme="purple"
          alignSelf="center"
          isLoading={loading}
        >
          作成
        </Button>
      </Flex>
    </form>
  );
}

function Project() {
  const user = useUser();
  const [projects, setProjects] = useState(null);
  const dispatch = useDispatch();

  async function createNewProject(project) {
    const newProjectId = await createProject(project);
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
    <>
      <Box mb="8">
        <Heading size="lg" mb="4">
          プロジェクト作成
        </Heading>
        <NewProject
          onSubmit={async (project) => {
            await createNewProject(project);
          }}
        />
      </Box>
      <Box mb="12">
        <Heading size="lg" mb="4">
          プロジェクト一覧
        </Heading>
        {projects === null ? (
          <Spinner />
        ) : (
          <SimpleGrid minChildWidth="30vw" spacing={4} marginTop={2}>
            {projects.length === 0 ? (
              <Card>
                <CardHeader>
                  プロジェクトをまだ作っていないようです👀
                </CardHeader>
                <CardBody>
                  <Box>
                    <Text>サインインしてプロジェクトを作成してみましょう</Text>
                  </Box>
                  {!user && (
                    <Button variant="link">
                      <Link to="/signin">サインインはこちら</Link>
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
    </>
  );
}

export default Project;
