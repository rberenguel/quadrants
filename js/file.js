import { getState, setState } from "./state.js";
import { renderApp } from "./app.js";
import { get, set, del } from "../lib/idb-keyval.js";

function isIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true; // Assume it's an iframe if access to window.top is denied
  }
}

export function toMarkdown() {
  const state = getState();
  let md = "";
  state.columns.forEach((c) => (md += `# C: ${c}\n`));
  state.rows.forEach((r) => (md += `# R: ${r}\n`));
  md += "\n";
  state.items.forEach((i) => {
    md += `## item\n`;
    md += `- text: ${JSON.stringify(i.text)}\n`;
    md += `- x: ${i.x}\n`;
    md += `- y: ${i.y}\n`;
    if (i.url) md += `- url: ${i.url}\n`;
    if (i.marked) md += `- marked: true\n`;
    if (i.color) md += `- color: ${i.color}\n`;
    if (i.fontSize && i.fontSize !== 100) md += `- fontSize: ${i.fontSize}\n`;
    md += "\n";
  });
  return md;
}

export function fromMarkdown(md) {
  const newState = { rows: [], columns: [], items: [] };
  const lines = md.split("\n");
  let currentItem = null;

  lines.forEach((line) => {
    line = line.trim();
    if (line.startsWith("# C:")) {
      newState.columns.push(line.substring(4).trim());
    } else if (line.startsWith("# R:")) {
      newState.rows.push(line.substring(4).trim());
    } else if (line.startsWith("## item")) {
      currentItem = { id: `item-${Date.now()}-${Math.random()}` };
      newState.items.push(currentItem);
    } else if (line.startsWith("- ") && currentItem) {
      const parts = line.substring(2).split(/:(.*)/s);
      if (parts.length > 1) {
        const key = parts[0].trim();
        const value = parts[1].trim();
        if (key === "marked") {
          currentItem.marked = value === "true";
        } else if (key === "text") {
          try {
            currentItem.text = JSON.parse(value);
          } catch (err) {
            currentItem.text = value; // Fallback for non-JSON text
          }
        } else if (key === "color") {
          currentItem.color = value;
        } else if (key === "fontSize") {
          currentItem.fontSize = parseInt(value, 10);
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
  const blob = new Blob([md], { type: "text/markdown" });
  const file = new File([blob], "quadrants.md", { type: "text/markdown" });

  if ("showSaveFilePicker" in window && !isIframe()) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: "quadrants.md",
        types: [
          {
            description: "Markdown Files",
            accept: { "text/markdown": [".md"] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (err) {
      console.log(
        "Save file picker was cancelled or failed, proceeding to fallbacks:",
        err,
      );
    }
  }

  const shareData = { files: [file] };
  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
      return;
    } catch (err) {
      console.log(
        "Share API was cancelled or failed, proceeding to final fallback:",
        err,
      );
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quadrants.md";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function loadFile() {
  const fileInput = document.getElementById("file-input");
  if (window.showOpenFilePicker && !isIframe()) {
    window
      .showOpenFilePicker()
      .then(async ([fileHandle]) => {
        // Store the file handle for future use
        await set("lastLoadedFile", fileHandle);
        const file = await fileHandle.getFile();
        const contents = await file.text();
        fromMarkdown(contents);
      })
      .catch((err) => console.error("Load cancelled or failed:", err));
  } else {
    fileInput.click();
  }
}

export async function checkLastFilePermission() {
  if (!window.showOpenFilePicker || isIframe()) {
    console.log(
      "File System Access API not supported, cannot check last file permission.",
    );
    return false;
  }

  try {
    const fileHandle = await get("lastLoadedFile");
    if (fileHandle) {
      const permissionStatus = await fileHandle.queryPermission();
      if (permissionStatus === "granted") {
        const file = await fileHandle.getFile();
        const contents = await file.text();
        fromMarkdown(contents);
        console.log("Successfully loaded last file.");
        return false; // No prompt needed, file loaded
      } else if (permissionStatus === "prompt") {
        console.log("Permission prompt needed for last loaded file.");
        return true; // Prompt needed
      } else {
        console.log("Permission denied for last loaded file.");
        await del("lastLoadedFile"); // Clear stale handle
        return false;
      }
    } else {
      console.log("No last loaded file found in cache.");
      return false;
    }
  } catch (err) {
    console.error("Error checking last file permission:", err);
    await del("lastLoadedFile");
    return false;
  }
}

export async function requestAndLoadLastFile() {
  if (!window.showOpenFilePicker || isIframe()) {
    console.log(
      "File System Access API not supported, cannot request and load last file.",
    );
    return;
  }

  try {
    const fileHandle = await get("lastLoadedFile");
    if (fileHandle) {
      const newPermissionStatus = await fileHandle.requestPermission();
      if (newPermissionStatus === "granted") {
        const file = await fileHandle.getFile();
        const contents = await file.text();
        fromMarkdown(contents);
        console.log("Successfully loaded last file after re-prompt.");
      } else {
        console.log("Permission denied for last loaded file.");
        await del("lastLoadedFile");
      }
    } else {
      console.log("No last loaded file found to request permission for.");
    }
  } catch (err) {
    console.error("Error requesting and loading last file:", err);
    await del("lastLoadedFile");
  }
}

async function inlineFonts(cssContent, baseUrl) {
  const fontFaceRegex = /@font-face\s*{[^}]+}/g;
  const urlRegex = /url\((['"]?)(.*?)\1\)/;

  const fontFaces = cssContent.match(fontFaceRegex) || [];
  const inlinedFontFaces = await Promise.all(
    fontFaces.map(async (fontFace) => {
      const urlMatch = fontFace.match(urlRegex);
      if (urlMatch) {
        const fontUrl = new URL(urlMatch[2], baseUrl).href;
        try {
          const response = await fetch(fontUrl);
          const blob = await response.blob();
          const reader = new FileReader();
          const dataUrl = await new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          return fontFace.replace(urlMatch[0], `url(${dataUrl})`);
        } catch (error) {
          console.error(`Failed to fetch font: ${fontUrl}`, error);
          return fontFace; // Return original if fetch fails
        }
      }
      return fontFace;
    }),
  );

  return cssContent.replace(fontFaceRegex, () => inlinedFontFaces.shift());
}

export async function exportToHtml() {
  const cssPaths = [
    "css/style.css",
    "fonts/monoid.css",
    "https://cdn.jsdelivr.net/gh/iconoir-icons/iconoir@main/css/iconoir.css",
  ];
  let combinedCss = "";

  for (const path of cssPaths) {
    const response = await fetch(path);
    let cssText = await response.text();
    if (path.includes("monoid.css")) {
      cssText = await inlineFonts(cssText, new URL(path, window.location.href));
    }
    combinedCss += cssText;
  }

  const mainContainer = document.getElementById("main-container");
  const contentHtml = mainContainer.innerHTML;
  const themeClass = document.body.classList.contains("light-theme")
    ? 'class="light-theme"'
    : "";

  const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Quadrants Export</title>
            <style>
                ${combinedCss}
            </style>
        </head>
        <body ${themeClass}>
            <div id="main-container">
                ${contentHtml}
            </div>
        </body>
        </html>
    `;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quadrants.html";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
