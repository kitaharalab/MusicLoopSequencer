// import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Project.css";

function Project() {
  const [done, setDone] = useState(false);
  const [sample, _setSample] = useState(null);
  let temp = 0;
  console.log("HOME");
  console.log(import.meta.env.VITE_SERVER_URL);

  const createNewProject = () => {
    const url = `${import.meta.env.VITE_SERVER_URL}/projects`;
    console.log(url);
    axios
      .post(url) // サーバーから音素材の配列を受け取った後，then部分を実行する．
      .then((response) => {
        const { projectid } = response.data;
        const div = document.getElementById("project");
        const newElement = document.createElement("p");
        const newProjectUrl = `App?projectid=${String(projectid)}`;
        const tag = `<a href=${newProjectUrl}>${projectid}</a>`;
        newElement.innerHTML = tag;
        div.appendChild(newElement);
      });
    console.log("OK");
  };

  useEffect(() => {
    let ignore = false;
    function makeLink() {
      (async () => {
        const url = `${import.meta.env.VITE_SERVER_URL}/projects`;
        if (done === false) {
          await axios
            .get(url) // サーバーから音素材の配列を受け取った後，then部分を実行する．
            .then((response) => {
              const div = document.getElementById("project");
              temp =
                response.data.projects_list[
                  response.data.projects_list.length - 1
                ];
              if (done === false) {
                for (let i = 0; i <= temp; i++) {
                  const newElement = document.createElement("p");
                  const newProjectUrl = `App?projectid=${String(i)}`;
                  const tag = `<a href=${newProjectUrl}>${i}</a>`;
                  newElement.innerHTML = tag;
                  div.appendChild(newElement);
                }
                const judge = true;
                setDone(judge);
              }
            });
        }
      })();
    }
    if (!ignore) {
      makeLink();
    }
    return () => {
      ignore = true;
    };
  }, [sample]);

  return (
    <div id="project">
      <button type="button" onClick={() => createNewProject()}>
        createNewProject
      </button>
    </div>
  );
}

export default Project;
