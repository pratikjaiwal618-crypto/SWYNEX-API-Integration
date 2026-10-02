const API_BASE = "https://api.restcountries.com/countries/v5";
const STORAGE_KEY = "globescope_api_key";
let countries = [];
let visibleCount = 12;

const $ = id => document.getElementById(id);

function setStatus(message, type = "") {
  $("status").className = `status ${type}`;
  $("status").innerHTML = type === "loading"
    ? `<span class="spinner"></span><span>${message}</span>`
    : `<span>${type === "success" ? "✓" : type === "warning" ? "⚠" : type === "error" ? "!" : "•"}</span><span>${message}</span>`;
  $("apiState").style.color = type === "success" ? "var(--success)" : type === "error" ? "var(--danger)" : "var(--warning)";
}

function getKey() {
  return localStorage.getItem(STORAGE_KEY) || "";
}

function saveKey() {
  const key = $("apiKeyInput").value.trim();
  if (!key) {
    setStatus("Please paste your REST Countries API key first.", "error");
    return;
  }
  localStorage.setItem(STORAGE_KEY, key);
  loadAllCountries();
}

function normalize(c) {
  const currencyEntries = c.currencies ? Object.values(c.currencies) : [];
  const currency = currencyEntries[0];
  const capitals = Array.isArray(c.capitals) ? c.capitals : [];
  const primaryCapital = capitals.find(x => x?.attributes?.primary) || capitals[0];

  const alpha2 = c.codes?.alpha_2 || "";
  const flagUrl = c.flag?.url_png ||
    (alpha2 ? `https://flags.restcountries.com/v5/w320/${alpha2.toLowerCase()}.png` : "");

  return {
    name: c.names?.common || "Unknown",
    official: c.names?.official || c.names?.common || "Unknown",
    capital: primaryCapital?.name || "No capital",
    region: c.region || "Other",
    population: Number(c.population || 0),
    currency: currency?.name || "Not available",
    alpha2,
    flagUrl,
    emoji: c.flag?.emoji || "🌍",
    description: c.flag?.description || `${c.names?.common || "Country"} flag`
  };
}

async function loadPage(offset) {
  const key = getKey();
  const url = `${API_BASE}?limit=100&offset=${offset}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${key}` }
  });
  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body?.errors?.[0]?.message || "";
    } catch {}
    throw new Error(detail || `API request failed (${response.status})`);
  }
  return response.json();
}

async function loadAllCountries() {
  setStatus("Connecting to REST Countries API v5...", "loading");
  countries = [];
  visibleCount = 12;
  render();

  try {
    const first = await loadPage(0);
    const firstObjects = first?.data?.objects || [];
    const meta = first?.data?.meta || {};
    countries = firstObjects.map(normalize);

    if (meta.more) {
      const second = await loadPage(100);
      countries = countries.concat((second?.data?.objects || []).map(normalize));
      const meta2 = second?.data?.meta || {};
      if (meta2.more) {
        const third = await loadPage(200);
        countries = countries.concat((third?.data?.objects || []).map(normalize));
      }
    }

    if (!countries.length) throw new Error("API returned no country records.");
    setStatus(`Live API connected successfully • ${countries.length} countries loaded`, "success");
    render();
  } catch (error) {
    console.error(error);
    setStatus(`API connection failed: ${error.message}. Check your key and CORS allowed origins.`, "error");
    render();
  }
}

function filtered() {
  const q = $("searchInput").value.trim().toLowerCase();
  const region = $("regionFilter").value;
  const sort = $("sortSelect").value;

  let result = countries.filter(c => {
    const text = `${c.name} ${c.official} ${c.capital} ${c.region} ${c.currency}`.toLowerCase();
    return text.includes(q) && (region === "all" || c.region === region);
  });

  result.sort((a,b) => {
    if (sort === "name-desc") return b.name.localeCompare(a.name);
    if (sort === "population-desc") return b.population - a.population;
    if (sort === "population-asc") return a.population - b.population;
    return a.name.localeCompare(b.name);
  });
  return result;
}

function render() {
  const result = filtered();
  const shown = result.slice(0, visibleCount);
  $("count").textContent = countries.length;
  $("grid").innerHTML = "";
  $("empty").classList.toggle("hidden", result.length > 0);

  shown.forEach(c => {
    const card = document.createElement("article");
    card.className = "card";
    const image = c.flagUrl
      ? `<img class="flag" src="${c.flagUrl}" alt="${escapeHtml(c.description)}" loading="lazy" onerror="this.outerHTML='<div class=&quot;flag&quot; style=&quot;display:grid;place-items:center;font-size:70px&quot;>${c.emoji}</div>'">`
      : `<div class="flag" style="display:grid;place-items:center;font-size:70px">${c.emoji}</div>`;

    card.innerHTML = `
      ${image}
      <div class="card-body">
        <h3>${escapeHtml(c.name)}</h3>
        <p class="meta">Capital: ${escapeHtml(c.capital)}</p>
        <p class="meta">Population: ${new Intl.NumberFormat().format(c.population)}</p>
        <div class="chips"><span class="chip">${escapeHtml(c.region)}</span><span class="chip">${escapeHtml(c.currency)}</span></div>
        <button class="btn secondary">View details</button>
      </div>
    `;
    card.querySelector("button").addEventListener("click", () => openDetails(c));
    $("grid").appendChild(card);
  });

  $("loadMoreBtn").classList.toggle("hidden", shown.length >= result.length);
}

function openDetails(c) {
  const image = c.flagUrl
    ? `<img class="details-cover" src="${c.flagUrl}" alt="${escapeHtml(c.description)}">`
    : `<div class="details-cover" style="display:grid;place-items:center;font-size:100px">${c.emoji}</div>`;

  $("details").innerHTML = `
    ${image}
    <div class="details-body">
      <h2>${escapeHtml(c.name)}</h2>
      <p class="meta">${escapeHtml(c.official)}</p>
      <div class="details-grid">
        <div class="detail-item"><small>Capital</small><strong>${escapeHtml(c.capital)}</strong></div>
        <div class="detail-item"><small>Region</small><strong>${escapeHtml(c.region)}</strong></div>
        <div class="detail-item"><small>Population</small><strong>${new Intl.NumberFormat().format(c.population)}</strong></div>
        <div class="detail-item"><small>Currency</small><strong>${escapeHtml(c.currency)}</strong></div>
        <div class="detail-item"><small>ISO Alpha-2</small><strong>${escapeHtml(c.alpha2)}</strong></div>
        <div class="detail-item"><small>Flag</small><strong>${c.emoji}</strong></div>
      </div>
    </div>
  `;
  $("detailsDialog").showModal();
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[ch]));
}

$("saveKeyBtn").addEventListener("click", saveKey);
$("apiKeyInput").addEventListener("keydown", e => { if (e.key === "Enter") saveKey(); });
$("refreshBtn").addEventListener("click", () => getKey() ? loadAllCountries() : setStatus("Enter your API key first.", "warning"));
$("searchInput").addEventListener("input", () => { visibleCount = 12; render(); });
$("regionFilter").addEventListener("change", () => { visibleCount = 12; render(); });
$("sortSelect").addEventListener("change", () => { visibleCount = 12; render(); });
$("loadMoreBtn").addEventListener("click", () => { visibleCount += 12; render(); });
$("closeDialog").addEventListener("click", () => $("detailsDialog").close());

$("themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("light");
  localStorage.setItem("globescope-theme", document.body.classList.contains("light") ? "light" : "dark");
  $("themeBtn").textContent = document.body.classList.contains("light") ? "☀" : "☾";
});
if (localStorage.getItem("globescope-theme") === "light") {
  document.body.classList.add("light");
  $("themeBtn").textContent = "☀";
}

const existingKey = getKey();
if (existingKey) {
  $("apiKeyInput").value = existingKey;
  loadAllCountries();
}
