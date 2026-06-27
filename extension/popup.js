const btnAdd   = document.getElementById("btnAdd");
const btnClear = document.getElementById("btnClear");
const status   = document.getElementById("status");

function setStatus(msg, type = "") {
  status.textContent = msg;
  status.className = type;
}

function setLoading(on) {
  btnAdd.disabled   = on;
  btnClear.disabled = on;
}

btnAdd.addEventListener("click", async () => {
  setLoading(true);
  setStatus("Ajout en cours…");

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.runtime.sendMessage({ action: "add", tab }, (response) => {
    setLoading(false);
    if (response?.ok) {
      setStatus("Lien ajouté ✓", "ok");
    } else {
      setStatus(response?.error || "Erreur", "err");
    }
  });
});

btnClear.addEventListener("click", async () => {

  setLoading(true);
  setStatus("Vidage en cours…");

  chrome.runtime.sendMessage({ action: "clear" }, (response) => {
    setLoading(false);
    if (response?.ok) {
      setStatus("Fichier vidé ✓", "ok");
    } else {
      setStatus(response?.error || "Erreur", "err");
    }
  });
});
