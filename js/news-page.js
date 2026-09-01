/* =============================================
   NEWS PAGE — renders news-data.json into:
   1. A magazine-style "Featured" section (hero + sidebar)
   2. A full "All Updates" archive list
   ============================================= */

function formatNewsDate(dateStr, fallbackLabel) {
  if (!dateStr) return fallbackLabel || "";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return fallbackLabel || dateStr;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

/* Fallback image if an item has none, or it fails to load —
   keeps layout intact regardless of what's in news-data.json */
const FALLBACK_IMAGE = "images/logo.png";

function imgTag(item, cssClass) {
  const src = item.image || FALLBACK_IMAGE;
  const alt = escapeHtml(item.headline || item.tag || "News");
  return `<img src="${src}" alt="${alt}" loading="lazy" class="${cssClass}"
            onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}';" />`;
}

/* ---------- Featured (magazine) section ---------- */
function renderFeatured(sorted) {
  const container = document.getElementById("news-featured");
  if (!container) return;

  if (!sorted.length) {
    container.innerHTML = "";
    return;
  }

  const hero = sorted[0];
  const sidebarItems = sorted.slice(1, 4); // up to 3 more

  const sidebarHtml = sidebarItems.map((item, i) => `
    <a href="#${item.id}" class="news-sidebar-item${i === 0 ? " is-highlight" : ""}">
      <span class="news-sidebar-date">${formatNewsDate(item.date, item.dateLabel)}</span>
      <span class="news-sidebar-tag">${escapeHtml(item.tag || "")}</span>
      <span class="news-sidebar-headline">${escapeHtml(item.headline || "")}</span>
    </a>
  `).join("");

  container.innerHTML = `
    <div class="news-hero-grid">
      <a href="#${hero.id}" class="news-hero-card">
        <div class="news-hero-image">
          ${imgTag(hero, "")}
        </div>
        <div class="news-hero-body">
          <span class="news-hero-meta">
            <span class="news-item-tag">${escapeHtml(hero.tag || "")}</span>
            <span class="news-item-date">${formatNewsDate(hero.date, hero.dateLabel)}</span>
          </span>
          <h2>${escapeHtml(hero.headline || "")}</h2>
          <p>${escapeHtml(hero.teaser || "")}</p>
        </div>
      </a>
      ${sidebarItems.length ? `<div class="news-sidebar">${sidebarHtml}</div>` : ""}
    </div>
  `;
}

/* ---------- Full archive list ---------- */
function renderArchive(sorted) {
  const container = document.getElementById("news-list");
  if (!container) return;

  if (!sorted.length) {
    container.innerHTML = '<p class="news-empty">No news posted yet — check back soon.</p>';
    return;
  }

  container.innerHTML = sorted.map(item => `
    <article class="news-item" id="${item.id}">
      <div class="news-item-image">
        ${imgTag(item, "")}
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

document.addEventListener("DOMContentLoaded", () => {
  fetch("news-data.json", { cache: "no-store" })
    .then(res => res.json())
    .then(items => {
      const sorted = [...(items || [])].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      renderFeatured(sorted);
      renderArchive(sorted);
    })
    .catch(() => {
      const list = document.getElementById("news-list");
      const featured = document.getElementById("news-featured");
      const msg = '<p class="news-empty">Couldn\'t load news right now — please refresh.</p>';
      if (list) list.innerHTML = msg;
      if (featured) featured.innerHTML = "";
    });
});
