import { initEventListeners } from "./events.js";
import { renderApp } from "./app.js";
import { checkLastFilePermission } from "./file.js";

document.addEventListener("DOMContentLoaded", async () => {
  initEventListeners();
  renderApp();
  const needsPermission = await checkLastFilePermission();
  if (needsPermission) {
    document.getElementById("reload-last-btn").style.display = "inline-block";
  }
});
