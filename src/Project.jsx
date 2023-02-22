import { Link } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Project() {
    const [done, setDone] = useState(false);
    const [sample, setSample] = useState(null);
    let temp = 0;
    console.log("HOME")

    const createNewProject = () => {
        const url = "http://127.0.0.1:5000/projects"
        axios.post(url)       //サーバーから音素材の配列を受け取った後，then部分を実行する．
            .then(function (response) {
                const projectid = response.data.projectid;
                const div = document.getElementById('project');
                let new_element = document.createElement('p');
                const url = 'App?projectid=' + String(projectid);
                const tag = `<a href=${url}>${projectid}</a>`
                new_element.innerHTML = tag;
                div.appendChild(new_element);

            });
        console.log("OK")
    };

    useEffect(() => {
        let ignore = false;
        function makeLink() {
            (async () => {
                const url = "http://127.0.0.1:5000/projects"
                if (done === false) {
                    await axios.get(url)       //サーバーから音素材の配列を受け取った後，then部分を実行する．
                        .then(function (response) {
                            const div = document.getElementById('project');
                            temp = response.data.projects_list[response.data.projects_list.length - 1]
                            if (done === false) {
                                for (let i = 0; i <= temp; i++) {
                                    let new_element = document.createElement('p');
                                    const url = 'App?projectid=' + String(i);
                                    const tag = `<a href=${url}>${i}</a>`
                                    new_element.innerHTML = tag;
                                    div.appendChild(new_element);
                                }
                                let judge = true;
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
        <>
            <div id="project">
                <button type="button" onClick={() => createNewProject()}>createNewProject</button>
            </div>
        </>
    );
};

export default Project;
