import { ChakraProvider, Box } from "@chakra-ui/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";

import App from "./App";
import Project from "./Project";
import Header from "./components/Header";
import SignIn from "./components/authentication/SignIn";
import SignUp from "./components/authentication/SignUp";
import ExperimentProjects from "./experiment/Projects";
import LoopSequencer from "./experiment/project/LoopSequencer";
import { store } from "./redux/store";
import reportWebVitals from "./reportWebVitals";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Header />
        <Outlet />
      </>
    ),
    children: [
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
    ],
  },
  {
    path: "/experiment",
    element: (
      <>
        <Header />
        <Outlet />
      </>
    ),
    children: [
      {
        path: "/experiment",
        element: <ExperimentProjects />,
      },
      {
        path: ":projectId",
        element: (
          <Provider store={store}>
            <LoopSequencer />
          </Provider>
        ),
      },
    ],
  },
  {
    path: "/signin",
    element: <SignIn />,
  },
  {
    path: "/signup",
    element: <SignUp />,
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
