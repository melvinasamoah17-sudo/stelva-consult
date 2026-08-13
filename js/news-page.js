/* =============================================
   NEWS PAGE — renders news-data.json into cards
   ============================================= */

function formatNewsDate(dateStr, fallbackLabel) {
  if (!dateStr) return fallbackLabel || "";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return fallbackLabel || dateStr;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function renderNewsList(items) {
  const container = document.getElementById("news-list");
  if (!container) return;

  if (!items || !items.length) {
    container.innerHTML = '<p class="news-empty">No news posted yet — check back soon.</p>';
    return;
  }

  // Newest first
  const sorted = [...items].sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  container.innerHTML = sorted.map(item => `
    <article class="news-item">
      <div class="news-item-image">
        <img src="${item.image}" alt="${escapeHtml(item.headline || item.tag || "News")}" loading="lazy" />
      </div>
      <div class="news-item-body">
        <div class="news-item-meta">
          <span class="news-item-tag">${escapeHtml(item.tag || "")}</span>
          <span class="news-item-date">${formatNewsDate(item.date, item.dateLabel)}</span>
        </div>
        <h2>${escapeHtml(item.headline || "")}</h2>
        <div class="news-item-content">${item.bodyHtml || `<p>${escapeHtml(item.teaser || "")}</p>`}</div>
      </div>
    </article>
  `).join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", () => {
  fetch("news-data.json", { cache: "no-store" })
    .then(res => res.json())
    .then(renderNewsList)
    .catch(() => {
      const container = document.getElementById("news-list");
      if (container) container.innerHTML = '<p class="news-empty">Couldn\'t load news right now — please refresh.</p>';
    });
});
