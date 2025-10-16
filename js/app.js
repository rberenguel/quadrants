import { render } from './ui.js';
import { attachDynamicEventListeners } from './events.js';

export function renderApp() {
    render();
    attachDynamicEventListeners();
}
