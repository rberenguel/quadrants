import { getState, setState } from './state.js';
import { renderApp } from './app.js';

export function toMarkdown() {
    const state = getState();
    let md = '';
    state.columns.forEach(c => md += `# C: ${c}\n`);
    state.rows.forEach(r => md += `# R: ${r}\n`);
    md += '\n';
    state.items.forEach(i => {
        md += `## item\n`;
        md += `- text: ${JSON.stringify(i.text)}\n`;
        md += `- x: ${i.x}\n`;
        md += `- y: ${i.y}\n`;
        if (i.url) md += `- url: ${i.url}\n`;
        if (i.marked) md += `- marked: true\n`;
        md += '\n';
    });
    return md;
}

export function fromMarkdown(md) {
    const newState = { rows: [], columns: [], items: [] };
    const lines = md.split('\n');
    let currentItem = null;
    
    lines.forEach(line => {
        line = line.trim();
        if (line.startsWith('# C:')) {
            newState.columns.push(line.substring(4).trim());
        } else if (line.startsWith('# R:')) {
            newState.rows.push(line.substring(4).trim());
        } else if (line.startsWith('## item')) {
            currentItem = { id: `item-${Date.now()}-${Math.random()}` };
            newState.items.push(currentItem);
        } else if (line.startsWith('- ') && currentItem) {
            const parts = line.substring(2).split(/:(.*)/s);
            if (parts.length > 1) {
                const key = parts[0].trim();
                const value = parts[1].trim();
                if (key === 'marked') {
                    currentItem.marked = value === 'true';
                } else if (key === 'text') {
                    try {
                        currentItem.text = JSON.parse(value);
                    } catch (err) {
                        currentItem.text = value; // Fallback for non-JSON text
                    }
                } else {
                    currentItem[key] = value;
                }
            }
        } else {
            currentItem = null;
        }
    });
    setState(newState);
}

export async function saveFile() {
    const md = toMarkdown();
    const blob = new Blob([md], { type: 'text/markdown' });
    const file = new File([blob], 'quadrants.md', { type: 'text/markdown' });

    if ('showSaveFilePicker' in window) {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: 'quadrants.md',
                types: [{
                    description: 'Markdown Files',
                    accept: { 'text/markdown': ['.md'] },
                }],
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            return;
        } catch (err) {
            console.log("Save file picker was cancelled or failed, proceeding to fallbacks:", err);
        }
    }

    const shareData = { files: [file] };
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        try {
            await navigator.share(shareData);
            return;
        } catch (err) {
            console.log("Share API was cancelled or failed, proceeding to final fallback:", err);
        }
    }
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quadrants.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function loadFile() {
    const fileInput = document.getElementById('file-input');
    if (window.showOpenFilePicker) {
        window.showOpenFilePicker().then(async ([fileHandle]) => {
            const file = await fileHandle.getFile();
            const contents = await file.text();
            fromMarkdown(contents);
        }).catch(err => console.error('Load cancelled or failed:', err));
    } else {
        fileInput.click();
    }
}