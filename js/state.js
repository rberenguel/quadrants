let state = {
  rows: [],
  columns: [],
  items: [],
  controlsHidden: true,
  lastMousePosition: { x: 0, y: 0 },
  lastUsedFontSize: 1.5,
};

let selectedItemId = null;
let justBlurred = false;
let itemInColorChangeMode = null;
let _renderApp = null; // To hold the renderApp function

export function setRenderAppCallback(callback) {
  _renderApp = callback;
}

export function getControlsHidden() {
  return state.controlsHidden;
}

export function setControlsHidden(value) {
  state.controlsHidden = value;
  if (_renderApp) _renderApp();
}

export function getItemInColorChangeMode() {
  return itemInColorChangeMode;
}

export function setItemInColorChangeMode(id) {
  itemInColorChangeMode = id;
}

export function getState() {
  return state;
}

export function setState(newState) {
  state = newState;
  if (_renderApp) _renderApp();
}

export function getSelectedItemId() {
  return selectedItemId;
}

export function setSelectedItemId(id) {
  selectedItemId = id;
}

export function getJustBlurred() {
  return justBlurred;
}

export function setJustBlurred(value) {
  justBlurred = value;
}

export function setLastMousePosition(x, y) {
  state.lastMousePosition = { x, y };
}

export function updateItem(id, updates) {
  const item = state.items.find((i) => i.id === id);
  if (item) {
    Object.assign(item, updates);
    if (updates.fontSize) {
      state.lastUsedFontSize = updates.fontSize;
    }
  }
  // A full re-render is often needed for items, e.g., if text changes size
  if (_renderApp) _renderApp();
}

export function deleteItem(id) {
  state.items = state.items.filter((i) => i.id !== id);
  setSelectedItemId(null);
  if (_renderApp) _renderApp();
}

export function addRow() {
  if (state.rows.length === 0 && state.columns.length === 0) {
    state.columns.push(":layout-right: Col 1");
  }
  state.rows.push(`:layout-left: Row ${state.rows.length + 1}`);
  if (_renderApp) _renderApp();
}

export function addColumn() {
  if (state.rows.length === 0 && state.columns.length === 0) {
    state.columns.push(":layout-right: Col 1");
  }
  state.columns.push(`:layout-right: Col ${state.columns.length + 1}`);
  if (_renderApp) _renderApp();
}

export function createItem(x, y) {
  const newItem = {
    id: `item-${Date.now()}`,
    text: "item",
    x: x.toFixed(2),
    y: y.toFixed(2),
    url: null,
    marked: false,
    color: "var(--cyan)",
    fontSize: state.lastUsedFontSize,
  };
  state.items.push(newItem);
  if (_renderApp) _renderApp();
}
