// ===== Demo job dataset =====
const JOBS = [
  { title: "Software Developer", company: "SafeBoda", city: "Kampala, Uganda", tags: ["javascript","react","node","software","developer","engineering"], pay: "UGX 3.5M–5M / mo" },
  { title: "Data Analyst", company: "M-KOPA", city: "Nairobi, Kenya", tags: ["sql","python","excel","data","analytics"], pay: "KES 120K–180K / mo" },
  { title: "Accountant", company: "Equity Bank", city: "Kigali, Rwanda", tags: ["accounting","excel","finance","sql"], pay: "RWF 800K–1.2M / mo" },
  { title: "Marketing Officer", company: "Jumia", city: "Dar es Salaam, Tanzania", tags: ["marketing","social media","content","sales"], pay: "TZS 1.5M–2.2M / mo" },
  { title: "Registered Nurse", company: "Aga Khan Hospital", city: "Addis Ababa, Ethiopia", tags: ["nursing","healthcare","patient care"], pay: "ETB 15K–22K / mo" },
  { title: "Logistics Coordinator", company: "DHL", city: "Mombasa, Kenya", tags: ["logistics","supply chain","excel"], pay: "KES 90K–130K / mo" },
  { title: "Customer Support Agent", company: "Tala", city: "Kampala, Uganda", tags: ["customer service","communication","crm"], pay: "UGX 1.2M–1.8M / mo" },
  { title: "Civil Engineer", company: "China Road & Bridge Corp", city: "Kigali, Rwanda", tags: ["engineering","autocad","construction"], pay: "RWF 1.5M–2.5M / mo" },
  { title: "Graphic Designer", company: "Twiga Foods", city: "Nairobi, Kenya", tags: ["design","photoshop","illustrator","graphic"], pay: "KES 70K–110K / mo" },
  { title: "Sales Representative", company: "Vodacom", city: "Dar es Salaam, Tanzania", tags: ["sales","negotiation","field work"], pay: "TZS 900K–1.4M / mo" },
  { title: "Frontend Developer", company: "Andela", city: "Nairobi, Kenya", tags: ["javascript","css","html","react","software"], pay: "KES 150K–220K / mo" },
  { title: "Warehouse Supervisor", company: "Bolloré Logistics", city: "Mogadishu, Somalia", tags: ["logistics","supply chain","operations"], pay: "USD 500–700 / mo" },
];

// ===== AI-style matching =====
function matchJobs(query){
  const q = query.trim().toLowerCase();
  if(!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);

  return JOBS.map(job => {
    let score = 0;
    const haystack = [job.title.toLowerCase(), ...job.tags].join(" ");
    terms.forEach(term => {
      if(job.title.toLowerCase().includes(term)) score += 3;
      job.tags.forEach(tag => {
        if(tag === term) score += 4;
        else if(tag.includes(term)) score += 2;
      });
    });
    return { job, score };
  })
  .filter(r => r.score > 0)
  .sort((a,b) => b.score - a.score)
  .slice(0,5)
  .map((r,i) => ({
    ...r,
    pct: Math.max(72, Math.min(98, 96 - i*6 - Math.floor(Math.random()*4)))
  }));
}

function renderResults(query){
  const container = document.getElementById("demo-results");
  const matches = matchJobs(query);

  if(!query.trim()){
    container.innerHTML = `<div class="demo-empty"><p>Results will appear here — type a skill above and hit <strong>Find matches</strong>.</p></div>`;
    return;
  }

  if(matches.length === 0){
    container.innerHTML = `<div class="demo-empty"><p>No matches for "${escapeHtml(query)}" in this demo set. Try: sql, sales, design, nursing, logistics.</p></div>`;
    return;
  }

  container.innerHTML = matches.map(({job, pct}) => `
    <div class="result-card">
      <div class="result-main">
        <h4>${job.title} — ${job.company}</h4>
        <p class="result-meta">${job.city} · ${job.pay}</p>
        <div class="result-tags">${job.tags.slice(0,4).map(t => `<span>${t}</span>`).join("")}</div>
      </div>
      <div class="result-score">
        <div class="pct">${pct}%</div>
        <div class="label">Match</div>
      </div>
    </div>
  `).join("");
}

function escapeHtml(str){
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

const demoInput = document.getElementById("demo-input");
const demoBtn = document.getElementById("demo-btn");

demoBtn.addEventListener("click", () => renderResults(demoInput.value));
demoInput.addEventListener("keydown", e => { if(e.key === "Enter") renderResults(demoInput.value); });
document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    demoInput.value = chip.dataset.chip;
    renderResults(demoInput.value);
  });
});

// ===== Register form =====
const form = document.getElementById("register-form");
form.addEventListener("submit", e => {
  e.preventDefault();
  form.hidden = true;
  document.getElementById("register-success").hidden = false;
});

// ===== Route map (signature element) =====
const CITIES = [
  { name: "Juba", x: 220, y: 60 },
  { name: "Addis Ababa", x: 520, y: 70 },
  { name: "Mogadishu", x: 650, y: 210 },
  { name: "Kampala", x: 230, y: 210 },
  { name: "Nairobi", x: 480, y: 240, hub: true },
  { name: "Kigali", x: 170, y: 270 },
  { name: "Bujumbura", x: 190, y: 330 },
  { name: "Dar es Salaam", x: 500, y: 410 },
];

const ROUTES = [
  ["Nairobi","Kampala"], ["Nairobi","Kigali"], ["Nairobi","Addis Ababa"],
  ["Nairobi","Dar es Salaam"], ["Nairobi","Mogadishu"], ["Nairobi","Juba"],
  ["Kampala","Kigali"], ["Kigali","Bujumbura"],
];

function buildMap(){
  const svg = document.getElementById("route-map");
  const byName = Object.fromEntries(CITIES.map(c => [c.name, c]));
  let defs = "";
  let routesSvg = "";
  let pulsesSvg = "";

  ROUTES.forEach(([a,b], i) => {
    const from = byName[a], to = byName[b];
    const pathId = `route-${i}`;
    const midX = (from.x + to.x) / 2 + (i % 2 === 0 ? -18 : 18);
    const midY = (from.y + to.y) / 2 + (i % 2 === 0 ? 18 : -18);
    const d = `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`;
    routesSvg += `<path id="${pathId}" class="route-line" d="${d}"></path>`;
    const dur = 3.5 + (i % 4) * 1.1;
    const delay = i * 0.4;
    pulsesSvg += `
      <circle class="route-pulse" r="3">
        <animateMotion dur="${dur}s" begin="${delay}s" repeatCount="indefinite">
          <mpath href="#${pathId}"></mpath>
        </animateMotion>
      </circle>`;
  });

  let citiesSvg = "";
  CITIES.forEach(c => {
    const r = c.hub ? 6 : 4;
    citiesSvg += `<circle class="city-dot" cx="${c.x}" cy="${c.y}" r="${r}"></circle>`;
    citiesSvg += `<text class="city-label" x="${c.x + r + 6}" y="${c.y + 4}">${c.name}</text>`;
  });

  svg.innerHTML = defs + routesSvg + pulsesSvg + citiesSvg;
}

buildMap();