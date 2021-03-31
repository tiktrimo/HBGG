import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import FrontPage from "./component/FrontPage.jsx";
import firebase from "firebase/app";
import "firebase/database";
import key from "./key/key";

firebase.initializeApp(key);
export const database = firebase.database();

ReactDOM.render(<FrontPage />, document.getElementById("root"));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
