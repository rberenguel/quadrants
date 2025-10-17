import { initEventListeners } from "./events.js";
import { renderApp } from "./app.js";
import { checkLastFilePermission } from "./file.js";
import { setLastMousePosition, setRenderAppCallback } from "./state.js";
import { showInfoHover, hideInfoHover } from "./infohover.js";
import "./modal.js";

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const fontSize = urlParams.get("fontSize");
  if (fontSize && !isNaN(parseFloat(fontSize))) {
    document.documentElement.style.fontSize = `${parseFloat(fontSize)}px`;
  }

  setRenderAppCallback(renderApp); // Register renderApp

  initEventListeners();
  renderApp();
  const needsPermission = await checkLastFilePermission();
  if (needsPermission) {
    document.getElementById("reload-last-btn").style.display = "inline-block";
  }

  document.addEventListener("mousemove", (e) => {
    setLastMousePosition(e.clientX, e.clientY);
  });
});
