import {
  Box,
  ButtonGroup,
  IconButton,
  Icon,
  Flex,
  Text,
  Center,
  Spacer,
  Card,
  CardBody,
  Divider,
  useToast,
  useTheme,
  Stack,
} from "@chakra-ui/react";
import * as d3 from "d3";
import React, { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  BiVolumeFull,
  BiSolidVolumeMute,
  BiRefresh,
  BiSolidTrashAlt,
  BiPlus,
} from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";

import Legend from "./Legend";
import ScatterPlot from "./ScatterPlot";

import getParts from "@/api/getParts";
import { sendLoopMuteLog } from "@/api/log";
import { onMusicLoop, insertSound, deleteLoop } from "@/api/loop";
import { useUser } from "@/components/Auth";
import { getApiParams, resetApiParam, setSongId } from "@/redux/apiParamSlice";

function ZoomableChart({ width, height, children, zoomState }) {
  const { zoomTransform, setZoomTransform } = zoomState;
  const svgRef = useRef();
  const reset =
    JSON.stringify(d3.zoomIdentity) === JSON.stringify(zoomTransform);
  if (reset) {
    d3.select(svgRef.current).call(d3.zoom().transform, d3.zoomIdentity);
  }

  useEffect(() => {
    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 20])
      .on("zoom", (event) => {
        setZoomTransform(event.transform);
      });

    d3.select(svgRef.current).call(zoom).on("dblclick.zoom", null);
  }, []);

  return (
    <Box backgroundColor="gray.50">
      <svg viewBox={`0 0 ${width} ${height}`} ref={svgRef}>
        <g
          transform={`translate(${zoomTransform?.x},${zoomTransform?.y}) scale(${zoomTransform?.k})`}
        >
          {children}
        </g>
      </svg>
    </Box>
  );
}

function Chart({ zoomState, handleOnClick, part }) {
  const [parts, setParts] = useState([]);

  useEffect(() => {
    (async () => {
      const partData = await getParts();
      setParts(partData);
    })();
  }, []);

  const theme = useTheme();

  const partName = parts.find(({ id }) => id === part)?.name?.toLowerCase();
  const partColor = partName ? theme.colors.part.light[partName] : null;
  const colors = theme.colors.part.sequence[partName] ?? null;

  const svgWidth = 500;
  const svgHeight = 500;

  function remToPx(rem) {
    return (
      rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
    );
  }

  const legendFontSize = remToPx(1.5);
  const legendSize = { width: svgWidth, height: legendFontSize * 4 };
  const legendMargin = {
    top: legendSize.height / 4.0,
    bottom: legendSize.height / 4.0,
    left: legendSize.width / 16.0,
    right: legendSize.width / 16.0,
  };
  const legendBarSize = {
    width: legendSize.width - legendMargin.left - legendMargin.right,
    height: legendFontSize * 2,
  };
  const legendProperty = {
    boxSize: legendSize,
    margin: legendMargin,
    barSize: legendBarSize,
    padding: legendSize.height / 16.0,
    fontSize: legendFontSize,
  };

  return (
    <Stack spacing={3}>
      <Legend partColor={partColor} property={legendProperty} colors={colors} />
      <ZoomableChart width={svgWidth} height={svgHeight} zoomState={zoomState}>
        <ScatterPlot
          boxSize={{ width: svgWidth, height: svgHeight }}
          handleOnClick={handleOnClick}
          partColor={partColor}
          partId={part}
          colors={colors}
        />
      </ZoomableChart>
    </Stack>
  );
}

function Content({ handlePlayAudio }) {
  const [isMute, setIsMute] = useState(false);
  const [zoomTransform, setZoomTransform] = useState(d3.zoomIdentity);
  const { projectId, songId, measure, partId, loopId } =
    useSelector(getApiParams);
  const zoomState = { zoomTransform, setZoomTransform };

  const insertToast = useToast();
  const deleteToast = useToast();
  const dispatch = useDispatch();

  const user = useUser();

  function handleOnClick(id) {
    if (!isMute) {
      handlePlayAudio(id);
    }
  }

  const insertLoop = async () => {
    if (partId == null || measure == null) {
      insertToast({
        title: "操作する対象の音素材が選択されていません",
        description: "曲を作成した後，右側の表からどれかを選択してください",
        status: "warning",
        position: "bottom-left",
        isClosable: true,
      });
      return;
    }
    if (loopId == null) {
      insertToast({
        title: "音素材が選択されていません",
        description:
          "右側の表から音素材を選択した後　左側に表示される図から音素材を選択してください",
        status: "warning",
        position: "bottom-left",
        isClosable: true,
      });
      return;
    }
    const inserting = insertSound(
      projectId,
      songId,
      partId,
      measure,
      loopId,
      user,
    );
    insertToast.promise(inserting, {
      success: {
        title: "追加完了",
        position: "bottom-left",
        isClosable: true,
      },
      error: {
        title: "追加失敗",
        description: "操作に失敗しました．再度試すか，リロードしてください",
        position: "bottom-left",
        isClosable: true,
      },
      loading: {
        title: "追加処理中......",
        position: "bottom-left",
        isClosable: false,
      },
    });
    const music = await inserting.finally(() => {
      dispatch(
        resetApiParam({
          measure: true,
          partId: true,
          loopId: true,
        }),
      );
    });

    flushSync(() => {
      dispatch(setSongId(undefined));
    });
    dispatch(setSongId(music.songId));
  };

  async function onDeleteLoop() {
    if (partId == null || measure == null) {
      insertToast({
        title: "操作する対象の音素材が選択されていません",
        description: "右側の表から削除したいものを選択してください",
        status: "warning",
        position: "bottom-left",
        isClosable: true,
      });
      return;
    }
    const deleting = deleteLoop(projectId, songId, measure, partId, user);
    deleteToast.promise(deleting, {
      success: {
        title: "削除完了",
        position: "bottom-left",
        isClosable: true,
      },
      error: {
        title: "削除失敗",
        description: "操作に失敗しました．再度試すか，リロードしてください",
        position: "bottom-left",
        isClosable: true,
      },
      loading: {
        title: "削除処理中......",
        position: "bottom-left",
        isClosable: false,
      },
    });

    await deleting;
  }

  return (
    <>
      <Flex alignContent="center" marginBottom={4} flexWrap="wrap">
        <Center>
          <Text>Preview</Text>
        </Center>
        <Spacer />
        <ButtonGroup>
          <IconButton
            icon={<Icon as={BiPlus} />}
            onClick={(event) => {
              event.preventDefault();
              insertLoop();
            }}
          />
          <IconButton
            icon={<Icon as={BiSolidTrashAlt} />}
            onClick={async (event) => {
              event.preventDefault();
              await onDeleteLoop();

              flushSync(() => {
                dispatch(setSongId(undefined));
              });
              dispatch(setSongId(songId));
            }}
          />
          <IconButton
            icon={<Icon as={isMute ? BiSolidVolumeMute : BiVolumeFull} />}
            onClick={async (event) => {
              event.preventDefault();
              const mute = !isMute;

              setIsMute(mute);
              sendLoopMuteLog(projectId, songId, mute, user);
            }}
          />
          <IconButton
            icon={<Icon as={BiRefresh} />}
            onClick={(event) => {
              event.preventDefault();
              setZoomTransform(d3.zoomIdentity);
            }}
          />
        </ButtonGroup>
      </Flex>
      <Divider />
      <Box>
        <Chart
          zoomState={zoomState}
          handleOnClick={handleOnClick}
          part={partId}
        />
      </Box>
    </>
  );
}

export default function LoopMaterialView() {
  const { projectId, songId, partId } = useSelector(getApiParams);
  const [audio, setAudio] = useState();

  const user = useUser();

  function handlePlayAudio(id, part) {
    async function getAndPlayMusicLoop() {
      audio?.pause();
      const loop = await onMusicLoop(projectId, songId, part, id, user);
      setAudio(loop);
      loop.volume = 0.5;
      loop.play();
    }
    getAndPlayMusicLoop();
  }

  return (
    <Card minWidth="100%" height="100%">
      <CardBody height="100%">
        <Content
          projectId={projectId}
          songId={songId}
          handlePlayAudio={(id) => {
            handlePlayAudio(id, partId);
          }}
        />
      </CardBody>
    </Card>
  );
}
