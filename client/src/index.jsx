import { ChakraProvider, Box } from "@chakra-ui/react";
import axios from "axios";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";

import { auth } from "./api/authentication/firebase";
import App from "./components/App";
import Header from "./components/Header";
import Project from "./components/Project";
import SignIn from "./components/authentication/SignIn";
import SignUp from "./components/authentication/SignUp";
import { store } from "./redux/store";
import reportWebVitals from "./reportWebVitals";
import theme from "./theme";

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
            <ChakraProvider theme={theme}>
              <App />
            </ChakraProvider>
          </Provider>
        ),
        loader: async ({ request }) => {
          const url = new URL(request.url);
          const urlParams = url.searchParams;
          const data = {
            open: true,
            id: urlParams.get("projectid"),
          };
          const idToken = await auth.currentUser?.getIdToken();
          axios.post(`${import.meta.env.VITE_SERVER_URL}/projects`, data, {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });
          return null;
        },
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
