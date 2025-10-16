import { getJustBlurred, setJustBlurred, createItem, updateItem, deleteItem, getState, getSelectedItemId, setSelectedItemId, setState } from './state.js';
import { renderApp } from './app.js';
import { saveFile, loadFile, fromMarkdown } from './file.js';

export function handleContainerClick(e) {
    if (getJustBlurred()) {
        return;
    }
    if (!e.target.closest('.item, .add-btn, [contenteditable]')) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        createItem(x, y);
    }
}

function handleFocusOut(e) {
    if (e.target.hasAttribute('contenteditable')) {
        setJustBlurred(true);
        setTimeout(() => { setJustBlurred(false); }, 100);
    }
}

function handleKeyDown(e) {
    const selectedItemId = getSelectedItemId();
    const state = getState();

    if (e.metaKey && e.key === 'k') {
        e.preventDefault();
        if (selectedItemId) {
            const item = state.items.find(i => i.id === selectedItemId);
            if (item) {
                const newUrl = prompt('Enter URL:', item.url || '');
                if (newUrl !== null) {
                   updateItem(item.id, { url: newUrl });
                }
            }
        }
        return;
    }

    if (e.target.closest('.item .edit-area')) {
        return;
    }

    if (selectedItemId) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
             e.preventDefault();
             deleteItem(selectedItemId);
        }
        
        if (e.code === 'Space') {
            e.preventDefault();
            const item = state.items.find(i => i.id === selectedItemId);
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
    const singleQuadrant = document.getElementById('single-quadrant');
    if (singleQuadrant) {
        singleQuadrant.addEventListener('click', handleContainerClick);
    }

    const quadrantGrid = document.getElementById('quadrant-grid');
    if (quadrantGrid) {
        quadrantGrid.addEventListener('click', handleContainerClick);
    }
}

export function selectItem(id) {
     setSelectedItemId(id);
     document.querySelectorAll('.item').forEach(el => {
        if (el.dataset.id === id) {
            el.classList.add('selected');
        } else {
            el.classList.remove('selected');
        }
     });
}

export function initEventListeners() {
    const saveBtn = document.getElementById('save-btn');
    const loadBtn = document.getElementById('load-btn');
    const clearBtn = document.getElementById('clear-btn');
    const fileInput = document.getElementById('file-input');

    saveBtn.addEventListener('click', saveFile);
    loadBtn.addEventListener('click', loadFile);
    clearBtn.addEventListener('click', () => {
        if(confirm('Are you sure you want to clear everything?')) {
            setState({ rows: [], columns: [], items: [] });
        }
    });

    document.addEventListener('focusout', handleFocusOut);
    document.addEventListener('keydown', handleKeyDown);
    fileInput.addEventListener('change', handleFileInputChange);
}
