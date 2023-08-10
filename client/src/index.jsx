import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { store } from "./redux/store";
import Project from "./Project";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Project />} />
      <Route
        path="/App"
        element={
          <Provider store={store}>
            <App />
          </Provider>
        }
      />
    </Routes>
  </BrowserRouter>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// <React.StrictMode></React.StrictMode>
