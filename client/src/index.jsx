import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
// eslint-disable-next-line import/no-extraneous-dependencies
import { ChakraProvider, Box } from "@chakra-ui/react";

import App from "./App";
import Project from "./Project";
import ExperimentProjects from "./experiment/Projects";
import LoopSequencer from "./experiment/project/LoopSequencer";
import { store } from "./redux/store";
import reportWebVitals from "./reportWebVitals";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Project />,
  },
  {
    path: "App",
    element: (
      <Provider store={store}>
        <App />
      </Provider>
    ),
  },
  {
    path: "/experiment",
    element: <ExperimentProjects />,
  },
  {
    path: "/experiment/:projectId",
    element: (
      <Provider store={store}>
        <LoopSequencer />
      </Provider>
    ),
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ChakraProvider>
      <Box p={4}>
        <RouterProvider router={router} />
      </Box>
    </ChakraProvider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

//
