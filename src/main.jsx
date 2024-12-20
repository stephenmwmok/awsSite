import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Authenticator } from "@aws-amplify/ui-react";

const signUpConfig = {
  hiddenDefaults: ["email"], // Hides email field (optional)
  signUpFields: [
    {
      label: "First Name",
      key: "given_name", // The key that will be used in AWS Cognito
      required: true,
      type: "string",
      displayOrder: 1,
    },
    {
      label: "Last Name",
      key: "family_name", // The key that will be used in AWS Cognito
      required: true,
      type: "string",
      displayOrder: 2,
    },
    {
      label: "Email",
      key: "email",
      required: true,
      type: "email",
      displayOrder: 3,
    },
    {
      label: "Password",
      key: "password",
      required: true,
      type: "password",
      displayOrder: 4,
    },
  ],
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Authenticator signUpConfig={signUpConfig}>
      <App />
    </Authenticator>
  </React.StrictMode>
);
