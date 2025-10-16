import { initEventListeners } from "./events.js";
import { renderApp } from "./app.js";
import { checkLastFilePermission } from "./file.js";

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const fontSize = urlParams.get("fontSize");
  if (fontSize && !isNaN(parseFloat(fontSize))) {
    document.documentElement.style.fontSize = `${parseFloat(fontSize)}px`;
  }

  initEventListeners();
  renderApp();
  const needsPermission = await checkLastFilePermission();
  if (needsPermission) {
    document.getElementById("reload-last-btn").style.display = "inline-block";
  }
});
