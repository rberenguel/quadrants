import {
  getJustBlurred,
  setJustBlurred,
  createItem,
  updateItem,
  deleteItem,
  getState,
  getSelectedItemId,
  setSelectedItemId,
  setState,
  setItemInColorChangeMode,
  getItemInColorChangeMode,
  getControlsHidden,
  setControlsHidden,
} from "./state.js";
import { renderApp } from "./app.js";
import {
  saveFile,
  loadFile,
  fromMarkdown,
  exportToHtml,
  requestAndLoadLastFile,
} from "./file.js";

// InteractJS is loaded globally via script tag in index.html
// import interact from 'https://cdn.jsdelivr.net/npm/interactjs/dist/interact.min.js';

const COLOR_MAP = {
  b: "var(--blue)",
  g: "var(--green)",
  c: "var(--cyan)",
  r: "var(--red)",
  m: "var(--magenta)",
  v: "var(--violet)",
  y: "var(--yellow)",
  o: "var(--orange)",
  s: "var(--base01)",
  w: "var(--base3)",
};

function handleAltClick(e) {
  if (e.altKey) {
    e.preventDefault();
    setControlsHidden(!getControlsHidden());
  }
}

function handleFocusOut(e) {
  if (e.target.hasAttribute("contenteditable")) {
    setJustBlurred(true);
    setTimeout(() => {
      setJustBlurred(false);
    }, 100);
  }
}

function handleKeyDown(e) {
  const selectedItemId = getSelectedItemId();
  const itemInColorChangeMode = getItemInColorChangeMode();
  const state = getState();

  if (itemInColorChangeMode) {
    if (COLOR_MAP[e.key]) {
      e.preventDefault();
      updateItem(itemInColorChangeMode, { color: COLOR_MAP[e.key] });
      setItemInColorChangeMode(null);
    } else {
      setItemInColorChangeMode(null);
    }
    return;
  }

  if (e.key === "c" && selectedItemId) {
    e.preventDefault();
    setItemInColorChangeMode(selectedItemId);
    return;
  }

  if (e.metaKey && e.key === "k") {
    e.preventDefault();
    if (selectedItemId) {
      const item = state.items.find((i) => i.id === selectedItemId);
      if (item) {
        const newUrl = prompt("Enter URL:", item.url || "");
        if (newUrl !== null) {
          updateItem(item.id, { url: newUrl });
        }
      }
    }
    return;
  }

  if (e.target.closest(".item .edit-area")) {
    return;
  }

  if (selectedItemId) {
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      deleteItem(selectedItemId);
    }

    if (e.code === "Space") {
      e.preventDefault();
      const item = state.items.find((i) => i.id === selectedItemId);
      if (item) {
        updateItem(item.id, { marked: !item.marked });
      }
    }
  }
}

function handleFileInputChange(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => fromMarkdown(e.target.result);
    reader.readAsText(file);
  }
  event.target.value = null;
}

export function attachDynamicEventListeners() {
  const mainContainer = document.getElementById("main-container");
  const singleQuadrant = document.getElementById("single-quadrant");
  const quadrantGrid = document.getElementById("quadrant-grid");

  // Clean up old listeners if they exist
  if (singleQuadrant) {
    interact(singleQuadrant).unset();
  }
  if (quadrantGrid) {
    interact(quadrantGrid).unset();
  }

  const targetElement = singleQuadrant || quadrantGrid;

  if (targetElement) {
    interact(targetElement).on("hold", (e) => {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      createItem(x, y);
    });
  }
}

export function selectItem(id) {
  setSelectedItemId(id);
  document.querySelectorAll(".item").forEach((el) => {
    if (el.dataset.id === id) {
      el.classList.add("selected");
    } else {
      el.classList.remove("selected");
    }
  });
}

export function initEventListeners() {
  const saveBtn = document.getElementById("save-btn");
  const loadBtn = document.getElementById("load-btn");
  const clearBtn = document.getElementById("clear-btn");
  const exportBtn = document.getElementById("export-btn");
  const reloadLastBtn = document.getElementById("reload-last-btn");
  const fileInput = document.getElementById("file-input");

  saveBtn.addEventListener("click", saveFile);
  loadBtn.addEventListener("click", loadFile);
  exportBtn.addEventListener("click", exportToHtml);
  reloadLastBtn.addEventListener("click", requestAndLoadLastFile);
  clearBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear everything?")) {
      setState({ rows: [], columns: [], items: [] });
    }
  });

  document.addEventListener("focusout", handleFocusOut);
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("click", handleAltClick);
  fileInput.addEventListener("change", handleFileInputChange);

  // Global hold listener for toggling controls
  interact(document.body).on("hold", (e) => {
    const mainContainer = document.getElementById("main-container");
    if (mainContainer && !mainContainer.contains(e.target)) {
      e.preventDefault();
      setControlsHidden(!getControlsHidden());
    }
  });
}
