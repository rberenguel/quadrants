import { updateItem } from './state.js';
import { renderApp } from './app.js';

export function initInteract() {
    const mainContainer = document.getElementById('main-container');

    interact('.item')
        .draggable({
            listeners: {
                move(event) {
                    const target = event.target;
                    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                    target.style.transform = `translate(${x}px, ${y}px)`;
                    target.setAttribute('data-x', x);
                    target.setAttribute('data-y', y);
                },
                end(event) {
                    const target = event.target;
                    const container = mainContainer.querySelector('.quadrant, .quadrant-grid');
                    if (!container) return;

                    const rect = container.getBoundingClientRect();
                    
                    const itemRect = target.getBoundingClientRect();
                    const itemX = itemRect.left - rect.left;
                    const itemY = itemRect.top - rect.top;

                    const percentX = (itemX / rect.width) * 100;
                    const percentY = (itemY / rect.height) * 100;
                    
                    target.style.transform = '';
                    target.setAttribute('data-x', 0);
                    target.setAttribute('data-y', 0);

                    updateItem(target.dataset.id, { 
                        x: percentX.toFixed(2), 
                        y: percentY.toFixed(2) 
                    });
                }
            }
        });
}