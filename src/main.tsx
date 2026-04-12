import React from "react";
import ReactDOM from "react-dom/client";
import { createDefaultCompositionRoot } from "./application/composition";
import { App } from "./ui/App";
import "./style.css";

const composition = createDefaultCompositionRoot();
const rootElement = document.querySelector<HTMLDivElement>("#app");

if (!rootElement) {
  throw new Error("Missing #app element");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App composition={composition} />
  </React.StrictMode>,
);
