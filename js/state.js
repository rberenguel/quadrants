import { renderApp } from './app.js';

let state = {
    rows: [],
    columns: [],
    items: []
};

let selectedItemId = null;
let justBlurred = false;

export function getState() {
    return state;
}

export function setState(newState) {
    state = newState;
    renderApp();
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

export function updateItem(id, updates) {
    const item = state.items.find(i => i.id === id);
    if (item) {
        Object.assign(item, updates);
    }
    // A full re-render is often needed for items, e.g., if text changes size
    renderApp();
}

export function deleteItem(id) {
    state.items = state.items.filter(i => i.id !== id);
    setSelectedItemId(null);
    renderApp();
}

export function addRow() {
    if (state.rows.length === 0 && state.columns.length === 0) {
         state.columns.push(':layout-right: Col 1');
    }
    state.rows.push(`:layout-left: Row ${state.rows.length + 1}`);
    renderApp();
}

export function addColumn() {
    if (state.rows.length === 0 && state.columns.length === 0) {
         state.rows.push(':layout-left: Row 1');
    }
    state.columns.push(`:layout-right: Col ${state.columns.length + 1}`);
    renderApp();
}

export function createItem(x, y) {
    const newItem = {
        id: `item-${Date.now()}`,
        text: 'item',
        x: x.toFixed(2),
        y: y.toFixed(2),
        url: null,
        marked: false
    };
    state.items.push(newItem);
    renderApp();
}