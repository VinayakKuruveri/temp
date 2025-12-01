// Fetch and render the tarkasangraha data from the pinned commit raw file.
// The raw file URL (using the provided commit OID) is used so the viewer is stable.
const RAW_URL = "https://raw.githubusercontent.com/ashtadhyayi-com/data/c763a0d917ac16cbd85ba1caa938de642ec73071/tarkasangraha/data.txt";

let DATA = [];

function el(tag, props = {}, ...children){
  const n = document.createElement(tag);
  for(const k of Object.keys(props)){
    if(k.startsWith("on") && typeof props[k] === "function"){
      n.addEventListener(k.slice(2).toLowerCase(), props[k]);
    } else if(k === "html"){
      n.innerHTML = props[k];
    } else {
      n.setAttribute(k, props[k]);
    }
  }
  for(const c of children){
    if(c == null) continue;
    if(typeof c === "string") n.appendChild(document.createTextNode(c));
    else n.appendChild(c);
  }
  return n;
}

async function loadData(){
  try{
    const res = await fetch(RAW_URL);
    if(!res.ok) throw new Error("Failed to fetch data: " + res.status);
    const txt = await res.text();
    // file is a JSON text (despite .txt extension) — parse
    const obj = JSON.parse(txt);
    if(!obj.data) throw new Error("Unexpected data format");
    DATA = obj.data.map(item => ({
      id: item.id,
      category: item.category || "",
      topic: item.topic || "",
      text: item.text || "",
      teeka: item.teeka || ""
    }));
    initUI();
  }catch(err){
    const entries = document.getElementById("entries");
    entries.innerHTML = "";
    entries.appendChild(el("div",{class:"empty"}, "Error loading data: " + err.message));
    console.error(err);
  }
}

function uniqueCategories(data){
  const set = new Set();
  data.forEach(d=>{
    // normalize: trim and use the full category string
    set.add((d.category || "").trim());
  });
  return Array.from(set).sort((a,b)=>a.localeCompare(b));
}

function renderCategories(){
  const catArea = document.getElementById("categories");
  catArea.innerHTML = "";
  catArea.appendChild(el("h3",{}, "Categories"));
  const ul = el("div",{class:"category-list"});
  const cats = uniqueCategories(DATA);
  // add "All" handled by select element as well, but we provide quick buttons here
  const buttonAll = el("button", {onclick:()=> setCategoryFilter("")}, "All (" + DATA.length + ")");
  ul.appendChild(buttonAll);
  for(const c of cats){
    const count = DATA.filter(d=> (d.category||"").trim() === c).length;
    const label = c || "(no category)";
    ul.appendChild(el("button", {onclick:()=> setCategoryFilter(c)}, `${label} (${count})`));
  }
  catArea.appendChild(ul);
}

function setCategoryFilter(cat){
  const sel = document.getElementById("categoryFilter");
  sel.value = cat;
  filterAndRender();
}

function renderCategorySelect(){
  const sel = document.getElementById("categoryFilter");
  sel.innerHTML = "<option value=''>All categories</option>";
  const cats = uniqueCategories(DATA);
  for(const c of cats){
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c || "(no category)";
    sel.appendChild(opt);
  }
  sel.addEventListener("change", filterAndRender);
}

function entryMatches(entry, q, onlyWithTeeka){
  if(onlyWithTeeka && !entry.teeka) return false;
  if(!q) return true;
  q = q.toLowerCase();
  return (entry.topic && entry.topic.toLowerCase().includes(q))
    || (entry.text && entry.text.toLowerCase().includes(q))
    || (entry.teeka && entry.teeka.toLowerCase().includes(q))
    || (entry.category && entry.category.toLowerCase().includes(q));
}

function filterAndRender(){
  const q = document.getElementById("search").value.trim();
  const cat = document.getElementById("categoryFilter").value;
  const onlyWithTeeka = document.getElementById("onlyWithTeeka").checked;
  let filtered = DATA.filter(e => entryMatches(e, q, onlyWithTeeka));
  if(cat){
    filtered = filtered.filter(e => ((e.category||"").trim() === cat));
  }
  renderEntries(filtered);
}

function renderEntries(list){
  const entries = document.getElementById("entries");
  entries.innerHTML = "";
  if(list.length === 0){
    entries.appendChild(el("div",{class:"empty"}, "No entries found."));
    return;
  }
  for(const item of list){
    const node = el("article", {class:"entry"});
    const meta = el("div",{class:"meta"},
      el("span", {class:"small"}, `ID: ${item.id}`),
      el("span", {class:"small"}, item.category ? `Category: ${item.category}` : ""),
    );
    node.appendChild(meta);
    node.appendChild(el("h2", {}, item.topic || "(no topic)"));
    node.appendChild(el("div", {class:"text"}, item.text || ""));
    if(item.teeka && item.teeka.trim()){
      const teeka = el("div", {class:"teeka"}, el("strong",{}, "टीका: "), el("div", {html: item.teeka}));
      node.appendChild(teeka);
    } else {
      // small hint to toggle show empty teeka entries
      node.appendChild(el("div",{class:"small"}, item.teeka ? "" : "No टीका"));
    }
    entries.appendChild(node);
  }
}

function initUI(){
  renderCategories();
  renderCategorySelect();
  // wire search & filter
  document.getElementById("search").addEventListener("input", debounce(filterAndRender, 250));
  document.getElementById("onlyWithTeeka").addEventListener("change", filterAndRender);
  // initial render
  filterAndRender();
}

function debounce(fn, ms=200){
  let t;
  return (...a)=>{
    clearTimeout(t);
    t = setTimeout(()=>fn(...a), ms);
  };
}

document.addEventListener("DOMContentLoaded", ()=> {
  // show a loading hint
  const entries = document.getElementById("entries");
  entries.innerHTML = "";
  entries.appendChild(el("div",{class:"empty"}, "Loading…"));
  loadData();
});