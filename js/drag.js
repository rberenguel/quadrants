import { updateItem, getState } from "./state.js";
import { showAlignmentLines, hideAlignmentLines } from "./ui.js";

const ALIGNMENT_TOLERANCE = 10; // pixels

export function initInteract() {
  const mainContainer = document.getElementById("main-container");

  interact(".item").draggable({
    listeners: {
      move(event) {
        const target = event.target;
        let x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
        let y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

        const state = getState();
        const draggedItemId = target.dataset.id;
        const otherItems = state.items.filter(
          (item) => item.id !== draggedItemId,
        );

        const container = mainContainer.querySelector(
          ".quadrant, .quadrant-grid",
        );
        if (!container) return;
        const containerRect = container.getBoundingClientRect();

        const draggedItemCurrentRect = event.rect;

        const alignmentLines = [];
        let snapped = false;
        otherItems.forEach((otherItem) => {
          const otherItemEl = document.querySelector(
            `[data-id="${otherItem.id}"]`,
          );
          if (!otherItemEl) return;
          const otherItemRect = otherItemEl.getBoundingClientRect();

          // Calculate potential snapped positions relative to the container
          const snappedX = x;
          const snappedY = y;

          // Check horizontal alignment
          // Top edge
          if (
            Math.abs(draggedItemCurrentRect.top - otherItemRect.top) <
            ALIGNMENT_TOLERANCE
          ) {
            //y = otherItemRect.top - draggedItemCurrentRect.top + y;
            alignmentLines.push({
              type: "horizontal",
              y: otherItemRect.top - containerRect.top,
            });
            snapped = true;
          }
          // Bottom edge
          if (
            Math.abs(draggedItemCurrentRect.bottom - otherItemRect.bottom) <
            ALIGNMENT_TOLERANCE
          ) {
            //y = otherItemRect.bottom - draggedItemCurrentRect.bottom + y;
            alignmentLines.push({
              type: "horizontal",
              y: otherItemRect.bottom - containerRect.top,
            });
            snapped = true;
          }
          // Vertical center
          if (
            Math.abs(
              draggedItemCurrentRect.top +
                draggedItemCurrentRect.height / 2 -
                (otherItemRect.top + otherItemRect.height / 2),
            ) < ALIGNMENT_TOLERANCE
          ) {
            //y = (otherItemRect.top + otherItemRect.height / 2) - (draggedItemCurrentRect.top + draggedItemCurrentRect.height / 2) + y;
            alignmentLines.push({
              type: "horizontal",
              y:
                otherItemRect.top +
                otherItemRect.height / 2 -
                containerRect.top,
            });
            snapped = true;
          }

          // Check vertical alignment
          // Left edge
          if (
            Math.abs(draggedItemCurrentRect.left - otherItemRect.left) <
            ALIGNMENT_TOLERANCE
          ) {
            //x = otherItemRect.left - draggedItemCurrentRect.left + x;
            alignmentLines.push({
              type: "vertical",
              x: otherItemRect.left - containerRect.left,
            });
            snapped = true;
          }
          // Right edge
          if (
            Math.abs(draggedItemCurrentRect.right - otherItemRect.right) <
            ALIGNMENT_TOLERANCE
          ) {
            //x = otherItemRect.right - draggedItemCurrentRect.right + x;
            alignmentLines.push({
              type: "vertical",
              x: otherItemRect.right - containerRect.left,
            });
            snapped = true;
          }
          // Horizontal center
          if (
            Math.abs(
              draggedItemCurrentRect.left +
                draggedItemCurrentRect.width / 2 -
                (otherItemRect.left + otherItemRect.width / 2),
            ) < ALIGNMENT_TOLERANCE
          ) {
            //x = (otherItemRect.left + otherItemRect.width / 2) - (draggedItemCurrentRect.left + draggedItemCurrentRect.width / 2) + x;
            alignmentLines.push({
              type: "vertical",
              x:
                otherItemRect.left +
                otherItemRect.width / 2 -
                containerRect.left,
            });
            snapped = true;
          }
        });

        target.style.transform = `translate(${x}px, ${y}px)`;
        target.setAttribute("data-x", x);
        target.setAttribute("data-y", y);
        //if(snapped) return
        showAlignmentLines(alignmentLines);
      },
      end(event) {
        const target = event.target;
        const container = mainContainer.querySelector(
          ".quadrant, .quadrant-grid",
        );
        if (!container) return;

        const rect = container.getBoundingClientRect();

        const itemRect = target.getBoundingClientRect();
        const itemX = itemRect.left - rect.left;
        const itemY = itemRect.top - rect.top;

        const percentX = (itemX / rect.width) * 100;
        const percentY = (itemY / rect.height) * 100;

        target.style.transform = "";
        target.setAttribute("data-x", 0);
        target.setAttribute("data-y", 0);

        updateItem(target.dataset.id, {
          x: percentX.toFixed(2),
          y: percentY.toFixed(2),
        });
        hideAlignmentLines();
      },
    },
  });
}
