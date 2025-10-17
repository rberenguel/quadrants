import {
  getState,
  addRow,
  addColumn,
  updateItem,
  setSelectedItemId,
  getControlsHidden,
} from "./state.js";
import { initInteract } from "./drag.js";
import { selectItem as selectItemHandler } from "./events.js";

const mainContainer = document.getElementById("main-container");

export function render() {
  const state = getState();
  mainContainer.innerHTML = ""; // Clear previous render

  const controls = document.querySelector(".controls");
  if (controls) {
    if (getControlsHidden()) {
      controls.classList.add("hidden");
    } else {
      //controls.classList.remove("hidden");
    }
  }

  const hasGrid = state.rows.length > 0 || state.columns.length > 0;
  const fragment = document.createDocumentFragment();

  if (!hasGrid) {
    const singleQuadrant = document.createElement("div");
    singleQuadrant.className = "quadrant";
    singleQuadrant.style.flexGrow = "1";
    singleQuadrant.style.position = "relative";
    singleQuadrant.id = "single-quadrant";

    const addColBtn = createAddButton("add-col-btn", addColumn);
    const addRowBtn = createAddButton("add-row-btn", addRow);
    singleQuadrant.appendChild(addColBtn);
    singleQuadrant.appendChild(addRowBtn);

    fragment.appendChild(singleQuadrant);
  } else {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.flexGrow = "1";
    wrapper.style.position = "relative";

    const columnHeaders = document.createElement("div");
    columnHeaders.className = "column-headers";
    columnHeaders.style.gridTemplateColumns = `50px repeat(${state.columns.length}, 1fr)`;

    columnHeaders.appendChild(document.createElement("div"));

    state.columns.forEach((title, index) => {
      columnHeaders.appendChild(createHeaderCell("column", title, index));
    });

    const contentArea = document.createElement("div");
    contentArea.className = "content-area";
    contentArea.style.flexGrow = "1";

    const rowHeaders = document.createElement("div");
    rowHeaders.className = "row-headers";
    rowHeaders.style.gridTemplateRows = `repeat(${state.rows.length}, 1fr)`;
    rowHeaders.style.width = "50px";

    state.rows.forEach((title, index) => {
      rowHeaders.appendChild(createHeaderCell("row", title, index));
    });

    const quadrantGrid = document.createElement("div");
    quadrantGrid.className = "quadrant-grid";
    quadrantGrid.style.gridTemplateRows = `repeat(${state.rows.length}, 1fr)`;
    quadrantGrid.style.gridTemplateColumns = `repeat(${state.columns.length}, 1fr)`;
    quadrantGrid.id = "quadrant-grid";

    for (let r = 0; r < state.rows.length; r++) {
      for (let c = 0; c < state.columns.length; c++) {
        const quadrant = document.createElement("div");
        quadrant.className = "quadrant";
        quadrantGrid.appendChild(quadrant);
      }
    }

    contentArea.appendChild(rowHeaders);
    contentArea.appendChild(quadrantGrid);

    const addColBtn = createAddButton("add-col-btn", addColumn);
    const addRowBtn = createAddButton("add-row-btn", addRow);
    contentArea.appendChild(addColBtn);
    contentArea.appendChild(addRowBtn);

    wrapper.appendChild(columnHeaders);
    wrapper.appendChild(contentArea);

    fragment.appendChild(wrapper);
  }

  mainContainer.appendChild(fragment);

  const container = mainContainer.querySelector(".quadrant, .quadrant-grid");
  if (container) {
    state.items.forEach((item) => {
      const itemEl = createItemElement(item);
      container.appendChild(itemEl);
    });
  }

  initInteract();
}

function createIconifiedContent(rawText, itemId) {
  const fragment = document.createDocumentFragment();
  let textToProcess = rawText;

  // Check for checkbox pattern
  const checkboxMatch = textToProcess.match(/^\s*\[([ x])\]\s*(.*)/);
  if (checkboxMatch) {
    const isChecked = checkboxMatch[1] === "x";
    textToProcess = checkboxMatch[2].trim();

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = isChecked;
    checkbox.className = "item-checkbox";
    checkbox.addEventListener("change", (e) => {
      const state = getState();
      const item = state.items.find((i) => i.id === itemId);
      if (item) {
        const newCheckedState = e.target.checked ? "x" : " ";
        const newText = `[${newCheckedState}] ${textToProcess}`;
        updateItem(itemId, { text: newText });
      }
    });
    fragment.appendChild(checkbox);
    fragment.appendChild(document.createTextNode(" ")); // Space after checkbox
  }

  // Check for icon pattern (only if no checkbox was found or if textToProcess still has content)
  const iconMatch = textToProcess.match(/^:([a-zA-Z0-9_-]+):(.*)/);
  if (iconMatch) {
    const iconName = iconMatch[1];
    textToProcess = iconMatch[2].trim();
    const iconSpan = document.createElement("span");
    iconSpan.className = `icon iconoir iconoir-${iconName}`;
    fragment.appendChild(iconSpan);
    if (textToProcess) {
      fragment.appendChild(document.createTextNode(" "));
    }
  }

  const lines = textToProcess.split("\n");
  lines.forEach((line, index) => {
    fragment.appendChild(document.createTextNode(line));
    if (index < lines.length - 1) {
      fragment.appendChild(document.createElement("br"));
    }
  });

  return fragment;
}

function createHeaderCell(type, title, index) {
  const cell = document.createElement("div");
  cell.className = "header-cell";
  const input = document.createElement("div");
  input.className = "header-input";
  input.setAttribute("contenteditable", "true");

  input.innerHTML = "";
  input.appendChild(createIconifiedContent(title, null));

  input.addEventListener("focus", (e) => {
    const state = getState();
    e.target.textContent =
      type === "column" ? state.columns[index] : state.rows[index];
  });

  input.addEventListener("blur", (e) => {
    const state = getState();
    const newTitle = e.target.textContent;
    if (type === "column") {
      state.columns[index] = newTitle;
    } else {
      state.rows[index] = newTitle;
    }
    e.target.innerHTML = "";
    e.target.appendChild(createIconifiedContent(newTitle, null));
  });

  cell.appendChild(input);
  return cell;
}

function createAddButton(id, onClick) {
  const btn = document.createElement("div");
  btn.id = id;
  btn.className = "add-btn";
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    onClick();
  });
  return btn;
}

function createItemElement(item) {
  const itemEl = document.createElement("div");
  itemEl.className = "item";
  itemEl.dataset.id = item.id;
  itemEl.style.left = `${item.x}%`;
  itemEl.style.top = `${item.y}%`;
  itemEl.style.color = item.color;
  itemEl.style.fontSize = `calc(${item.fontSize || 1.5} * (1vw + 1vh))`;

  if (item.marked) {
    itemEl.classList.add("marked");
  }

  const content = createIconifiedContent(item.text, item.id);

  if (item.url) {
    const link = document.createElement("a");
    link.href = item.url;
    link.target = "_blank";
    link.appendChild(content);
    itemEl.appendChild(link);
  } else {
    itemEl.appendChild(content);
  }

  itemEl.addEventListener("click", (e) => {
    if (e.target.tagName !== "A" && e.target.tagName !== "INPUT") {
      startEditingItem(itemEl, item);
    }
  });

  itemEl.addEventListener("mouseenter", () => selectItemHandler(item.id));
  itemEl.addEventListener("mouseleave", () => selectItemHandler(null));

  return itemEl;
}

function startEditingItem(itemEl, item) {
  const editArea = document.createElement("div");
  editArea.className = "edit-area";
  editArea.setAttribute("contenteditable", "true");
  editArea.textContent = item.text;

  const handleBlur = (e) => {
    updateItem(item.id, { text: e.target.innerText });
  };

  editArea.addEventListener("blur", handleBlur, { once: true });

  itemEl.innerHTML = "";
  itemEl.appendChild(editArea);

  editArea.focus();
  window.getSelection().selectAllChildren(editArea);
}

export function showAlignmentLines(lines) {
  hideAlignmentLines(); // Clear existing lines

  const container = mainContainer.querySelector(".quadrant, .quadrant-grid");
  if (!container) return;

  const containerRect = container.getBoundingClientRect();

  lines.forEach((line) => {
    const lineEl = document.createElement("div");
    lineEl.classList.add("alignment-line");
    if (line.type === "horizontal") {
      lineEl.style.top = `${line.y}px`;
      lineEl.style.left = `0`;
      lineEl.style.right = `0`;
      lineEl.style.height = `1px`;
    } else if (line.type === "vertical") {
      lineEl.style.left = `${line.x}px`;
      lineEl.style.top = `0`;
      lineEl.style.bottom = `0`;
      lineEl.style.width = `1px`;
    }
    container.appendChild(lineEl);
  });
}

export function hideAlignmentLines() {
  document.querySelectorAll(".alignment-line").forEach((el) => el.remove());
}
