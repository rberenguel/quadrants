const modalOverlay = document.getElementById("modal-overlay");
const modalText = document.getElementById("modal-text");
const modalButtons = document.getElementById("modal-buttons");

function showModal(content, buttons) {
  if (typeof content === "string") {
    modalText.textContent = content;
  } else {
    modalText.innerHTML = "";
    modalText.appendChild(content);
  }
  modalButtons.innerHTML = "";
  buttons.forEach((btn) => {
    const buttonEl = document.createElement("button");
    buttonEl.className = `btn ${btn.class || ""}`;
    buttonEl.textContent = btn.label;
    buttonEl.addEventListener("click", () => {
      hideModal();
      if (btn.onClick) {
        btn.onClick();
      }
    });
    modalButtons.appendChild(buttonEl);
  });
  modalOverlay.style.display = "flex";
}

function hideModal() {
  modalOverlay.style.display = "none";
}

export function showConfirm(text, onConfirm) {
  showModal(text, [
    {
      label: "Cancel",
      onClick: () => {},
    },
    {
      label: "OK",
      class: "btn-confirm",
      onClick: onConfirm,
    },
  ]);
}

export function showPrompt(text, defaultValue, onConfirm) {
  const content = document.createElement("div");
  const label = document.createElement("label");
  label.textContent = text;
  const input = document.createElement("input");
  input.type = "text";
  input.value = defaultValue;
  input.className = "modal-input";
  content.appendChild(label);
  content.appendChild(input);

  showModal(content, [
    {
      label: "Cancel",
      onClick: () => {},
    },
    {
      label: "OK",
      class: "btn-confirm",
      onClick: () => onConfirm(input.value),
    },
  ]);

  input.focus();
  input.select();
}
