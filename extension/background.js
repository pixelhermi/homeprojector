const GITHUB_TOKEN = CONFIG.GITHUB_TOKEN;
const OWNER        = CONFIG.OWNER;
const REPO         = CONFIG.REPO;
const FILE_PATH    = "videolinks.json";

// ─── helpers ────────────────────────────────────────────────────────────────

async function getFile() {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
    {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json"
      }
    }
  );
  if (!res.ok) throw new Error("Impossible de récupérer le fichier");
  return res.json(); // { content, sha, … }
}

async function pushFile(videos, sha, commitMessage) {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json"
      },
      body: JSON.stringify({
        message: commitMessage,
        content: btoa(JSON.stringify(videos, null, 2)),
        sha
      })
    }
  );
  if (!res.ok) throw new Error("Impossible de mettre à jour GitHub");
}

// ─── message handler ─────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === "add") {
    handleAdd(msg.tab)
      .then(() => sendResponse({ ok: true }))
      .catch((err) => sendResponse({ ok: false, error: err.message }));
    return true; // keep channel open for async response
  }

  if (msg.action === "clear") {
    handleClear()
      .then(() => sendResponse({ ok: true }))
      .catch((err) => sendResponse({ ok: false, error: err.message }));
    return true;
  }
});

// ─── actions ─────────────────────────────────────────────────────────────────

async function handleAdd(tab) {
  const fileData = await getFile();
  const videos   = JSON.parse(atob(fileData.content));

  videos.unshift({
    id:         crypto.randomUUID(),
    title:      tab.title,
    url:        tab.url,
    created_at: new Date().toISOString()
  });

  await pushFile(videos, fileData.sha, `add video: ${tab.title}`);
  notify("Lien ajouté");
}

async function handleClear() {
  const fileData = await getFile();
  await pushFile([], fileData.sha, "clear all videos");
  notify("Liens vidés");
}

// ─── notify ──────────────────────────────────────────────────────────────────

function notify(message) {
  if (!chrome.notifications) { alert(message); return; }
  chrome.notifications.create({
    type:     "basic",
    iconUrl:  "icon.png",
    title:    "Projecteur",
    message
  });
}
