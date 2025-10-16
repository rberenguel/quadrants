import { initEventListeners } from './events.js';
import { renderApp } from './app.js';

document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    renderApp();
});
